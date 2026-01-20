import { Op } from 'sequelize';
import { Region } from '../models/Region';
import { City } from '../models/City';
import { StreetType } from '../models/StreetType';
import { Street } from '../models/Street';
import { Building } from '../models/Building';
import { Apartment } from '../models/Apartment';
import { CoverageAutocompleteService, AddressSuggestion } from './coverage-autocomplete.service';
import { logger } from '../utils/logger';

// Типы для результатов запросов с ассоциациями
type CityWithRegion = City & {
  region?: Region;
};

type StreetWithAssociations = Street & {
  city?: CityWithRegion;
  streetType?: StreetType;
};

export class LocationService {
  private coverageAutocompleteService: CoverageAutocompleteService;

  constructor() {
    this.coverageAutocompleteService = new CoverageAutocompleteService();
  }

  /**
   * Получить все регионы
   */
  async getRegions(): Promise<Region[]> {
    return Region.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Получить города по региону
   */
  async getCitiesByRegion(regionId: number): Promise<CityWithRegion[]> {
    return City.findAll({
      where: { regionId },
      include: [
        {
          model: Region,
          as: 'region',
          attributes: ['id', 'name'],
        },
      ],
      order: [['name', 'ASC']],
    }) as Promise<CityWithRegion[]>;
  }

  /**
   * Получить все типы улиц
   */
  async getStreetTypes(): Promise<StreetType[]> {
    return StreetType.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Получить улицы по городу (с фильтром по типу)
   */
  async getStreetsByCity(
    cityId: number,
    streetTypeId?: number
  ): Promise<StreetWithAssociations[]> {
    const where: any = { cityId };
    if (streetTypeId) {
      where.streetTypeId = streetTypeId;
    }

    return Street.findAll({
      where,
      include: [
        {
          model: City,
          as: 'city',
          attributes: ['id', 'name'],
        },
        {
          model: StreetType,
          as: 'streetType',
          attributes: ['id', 'name', 'shortName'],
        },
      ],
      order: [['name', 'ASC']],
    }) as Promise<StreetWithAssociations[]>;
  }

  /**
   * Получить дома по улице
   */
  async getBuildingsByStreet(streetId: number): Promise<Building[]> {
    return Building.findAll({
      where: { streetId },
      include: [
        {
          model: Street,
          as: 'street',
          attributes: ['id', 'name'],
          include: [
            {
              model: StreetType,
              as: 'streetType',
              attributes: ['id', 'name', 'shortName'],
            },
          ],
        },
      ],
      order: [['number', 'ASC']],
    });
  }

  /**
   * Получить квартиры по дому
   */
  async getApartmentsByBuilding(buildingId: number): Promise<Apartment[]> {
    return Apartment.findAll({
      where: { buildingId },
      include: [
        {
          model: Building,
          as: 'building',
          attributes: ['id', 'number', 'building'],
        },
      ],
      order: [['number', 'ASC']],
    });
  }

  /**
   * Поиск адреса из базы данных покрытия
   */
  async searchAddress(query: string, limit: number = 10): Promise<AddressSuggestion[]> {
    try {
      return await this.coverageAutocompleteService.search(query, limit);
    } catch (error: any) {
      logger.error('Address search error', {
        error: error?.message || String(error),
        query,
        stack: error?.stack,
      });
      throw error;
    }
  }

  /**
   * Автодополнение адреса из базы данных покрытия
   */
  async autocompleteAddress(query: string, limit: number = 10): Promise<AddressSuggestion[]> {
    try {
      return await this.coverageAutocompleteService.autocomplete(query, limit);
    } catch (error: any) {
      logger.error('Address autocomplete error', {
        error: error?.message || String(error),
        query,
        stack: error?.stack,
      });
      throw error;
    }
  }

  /**
   * Поиск в локальной БД (если адрес уже сохранен)
   */
  async searchLocal(query: string): Promise<any[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    // Поиск по городам
    const cities = await City.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: searchTerm } },
          { nameEn: { [Op.iLike]: searchTerm } },
        ],
      },
      include: [
        {
          model: Region,
          as: 'region',
          attributes: ['id', 'name'],
        },
      ],
      limit: 5,
    }) as CityWithRegion[];

    // Поиск по улицам
    const streets = await Street.findAll({
      where: {
        name: { [Op.iLike]: searchTerm },
      },
      include: [
        {
          model: City,
          as: 'city',
          attributes: ['id', 'name'],
          include: [
            {
              model: Region,
              as: 'region',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: StreetType,
          as: 'streetType',
          attributes: ['id', 'name', 'shortName'],
        },
      ],
      limit: 5,
    }) as StreetWithAssociations[];

    return [
      ...cities.map((city) => ({
        type: 'city',
        id: city.id,
        name: city.name,
        region: city.region?.name,
        latitude: city.latitude,
        longitude: city.longitude,
      })),
      ...streets.map((street) => ({
        type: 'street',
        id: street.id,
        name: street.name,
        city: street.city?.name,
        region: street.city?.region?.name,
        streetType: street.streetType?.shortName,
        latitude: street.latitude,
        longitude: street.longitude,
      })),
    ];
  }

  /**
   * Создать или найти город
   * Если город существует, возвращает его, иначе создает новый
   */
  async createOrFindCity(
    name: string,
    regionId?: number,
    latitude?: number,
    longitude?: number
  ): Promise<City> {
    // Сначала ищем существующий город
    const existingCity = await City.findOne({
      where: {
        name: { [Op.iLike]: name.trim() },
        ...(regionId ? { regionId } : {}),
      },
    });

    if (existingCity) {
      return existingCity;
    }

    // Если регион не указан, используем первый доступный или создаем дефолтный
    let finalRegionId = regionId;
    if (!finalRegionId) {
      const defaultRegion = await Region.findOne({ order: [['id', 'ASC']] });
      if (!defaultRegion) {
        throw new Error('No regions found in database. Please create at least one region.');
      }
      finalRegionId = defaultRegion.id;
    }

    // Создаем новый город
    return City.create({
      name: name.trim(),
      regionId: finalRegionId,
      latitude: latitude || null,
      longitude: longitude || null,
    });
  }

  /**
   * Создать или найти улицу
   * Если улица существует, возвращает ее, иначе создает новую
   */
  async createOrFindStreet(
    name: string,
    cityId: number,
    streetTypeId?: number,
    latitude?: number,
    longitude?: number
  ): Promise<Street> {
    // Сначала ищем существующую улицу
    const existingStreet = await Street.findOne({
      where: {
        name: { [Op.iLike]: name.trim() },
        cityId,
        ...(streetTypeId ? { streetTypeId } : {}),
      },
    });

    if (existingStreet) {
      return existingStreet;
    }

    // Если тип улицы не указан, используем дефолтный (обычно "улица")
    let finalStreetTypeId = streetTypeId;
    if (!finalStreetTypeId) {
      const defaultStreetType = await StreetType.findOne({
        where: { shortName: 'ул.' },
      });
      if (!defaultStreetType) {
        // Если нет типа "улица", берем первый доступный
        const firstStreetType = await StreetType.findOne({ order: [['id', 'ASC']] });
        if (!firstStreetType) {
          throw new Error('No street types found in database. Please create at least one street type.');
        }
        finalStreetTypeId = firstStreetType.id;
      } else {
        finalStreetTypeId = defaultStreetType.id;
      }
    }

    // Создаем новую улицу
    return Street.create({
      name: name.trim(),
      cityId,
      streetTypeId: finalStreetTypeId,
      latitude: latitude || null,
      longitude: longitude || null,
    });
  }

  /**
   * Создать или найти дом
   * Если дом существует, возвращает его, иначе создает новый
   */
  async createOrFindBuilding(
    number: string,
    streetId: number,
    building?: string,
    latitude?: number,
    longitude?: number,
    postalCode?: string
  ): Promise<Building> {
    // Сначала ищем существующий дом
    const existingBuilding = await Building.findOne({
      where: {
        number: number.trim(),
        streetId,
        ...(building ? { building: building.trim() } : { building: null }),
      },
    });

    if (existingBuilding) {
      return existingBuilding;
    }

    // Создаем новый дом
    return Building.create({
      number: number.trim(),
      streetId,
      building: building?.trim() || null,
      latitude: latitude || null,
      longitude: longitude || null,
      postalCode: postalCode || null,
    });
  }

  /**
   * Создать или найти квартиру
   */
  async createOrFindApartment(
    number: string,
    buildingId: number
  ): Promise<Apartment> {
    // Сначала ищем существующую квартиру
    const existingApartment = await Apartment.findOne({
      where: {
        number: number.trim(),
        buildingId,
      },
    });

    if (existingApartment) {
      return existingApartment;
    }

    // Создаем новую квартиру
    return Apartment.create({
      number: number.trim(),
      buildingId,
    });
  }
}
