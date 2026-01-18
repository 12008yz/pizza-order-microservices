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
}
