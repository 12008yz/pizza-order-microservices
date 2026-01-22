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
      attributes: ['id', 'number', 'building', 'entrances', 'floors', 'apartmentsPerFloor', 'streetId', 'latitude', 'longitude', 'postalCode'],
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
  /**
   * Получить структуру дома (подъезды, этажи, квартиры на этаже)
   */
  async getBuildingStructure(buildingId: number): Promise<{
    building: Building;
    entrances: number | null;
    floors: number | null;
    apartmentsPerFloor: number | null;
  }> {
    const building = await Building.findByPk(buildingId);
    if (!building) {
      throw new Error(`Building with id ${buildingId} not found`);
    }
    return {
      building,
      entrances: building.entrances,
      floors: building.floors,
      apartmentsPerFloor: building.apartmentsPerFloor,
    };
  }

  /**
   * Генерировать список квартир на основе структуры дома
   * Если указан подъезд, генерируем квартиры только для этого подъезда
   * Если указан этаж, генерируем квартиры только для этого этажа
   */
  generateApartmentSuggestions(
    entrances: number | null,
    floors: number | null,
    apartmentsPerFloor: number | null,
    entrance?: number | null,
    floor?: number | null
  ): Array<{ number: string; entrance: number; floor: number }> {
    const suggestions: Array<{ number: string; entrance: number; floor: number }> = [];

    // Если структура дома не указана, возвращаем пустой массив
    if (!entrances || !floors || !apartmentsPerFloor) {
      return suggestions;
    }

    // Определяем диапазон подъездов
    const entranceStart = entrance ? entrance : 1;
    const entranceEnd = entrance ? entrance : entrances;

    // Определяем диапазон этажей
    const floorStart = floor ? floor : 1;
    const floorEnd = floor ? floor : floors;

    // Генерируем квартиры
    for (let ent = entranceStart; ent <= entranceEnd; ent++) {
      for (let fl = floorStart; fl <= floorEnd; fl++) {
        // Вычисляем начальный номер квартиры для этого подъезда и этажа
        // Формула: (подъезд - 1) * (этажей * квартир на этаже) + (этаж - 1) * квартир на этаже + 1
        const apartmentStart = (ent - 1) * (floors * apartmentsPerFloor) + (fl - 1) * apartmentsPerFloor + 1;
        
        for (let apt = 0; apt < apartmentsPerFloor; apt++) {
          const apartmentNumber = apartmentStart + apt;
          suggestions.push({
            number: apartmentNumber.toString(),
            entrance: ent,
            floor: fl,
          });
        }
      }
    }

    return suggestions;
  }

  async getApartmentsByBuilding(
    buildingId: number,
    entrance?: number | null,
    floor?: number | null
  ): Promise<Array<Apartment | { number: string; entrance: number; floor: number; id?: number }>> {
    // Получаем структуру дома
    const structure = await this.getBuildingStructure(buildingId);

    // Если структура дома указана, генерируем подсказки
    if (structure.entrances && structure.floors && structure.apartmentsPerFloor) {
      const generated = this.generateApartmentSuggestions(
        structure.entrances,
        structure.floors,
        structure.apartmentsPerFloor,
        entrance,
        floor
      );

      // Если есть сгенерированные подсказки, возвращаем их
      if (generated.length > 0) {
        return generated.map((apt) => ({
          id: undefined,
          number: apt.number,
          buildingId,
          entrance: apt.entrance,
          floor: apt.floor,
        })) as any[];
      }
    }

    // Иначе возвращаем существующие квартиры из БД
    return Apartment.findAll({
      where: {
        buildingId,
        ...(entrance ? { entrance } : {}),
        ...(floor ? { floor } : {}),
      },
      include: [
        {
          model: Building,
          as: 'building',
          attributes: ['id', 'number', 'building', 'entrances', 'floors', 'apartmentsPerFloor'],
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
   * Использует fallback на локальную БД, если provider-service недоступен или данных нет
   * @param query - поисковый запрос
   * @param limit - максимальное количество результатов
   * @param cityId - опциональный ID города для фильтрации улиц
   */
  async autocompleteAddress(query: string, limit: number = 10, cityId?: number): Promise<AddressSuggestion[]> {
    try {
      logger.info('Starting autocomplete search', { query, limit });
      const coverageResults = await this.coverageAutocompleteService.autocomplete(query, limit);
      logger.info('Coverage results', { query, count: coverageResults?.length || 0 });
      
      // Если есть результаты из coverage, возвращаем их
      if (coverageResults && coverageResults.length > 0) {
        logger.info('Returning coverage results', { query, count: coverageResults.length });
        return coverageResults;
      }
      
      // Fallback: ищем в локальной БД location-service
      logger.info('No coverage results found, falling back to local database search', { query, cityId });
      const localResults = await this.searchLocal(query, cityId);
      logger.info('Local search results', { query, cityId, count: localResults?.length || 0 });
      
      // Преобразуем результаты локального поиска в формат AddressSuggestion
      const suggestions: AddressSuggestion[] = localResults.slice(0, limit).map((item: any) => {
        if (item.type === 'city') {
          return {
            text: item.name,
            formatted: item.region ? `${item.name}, ${item.region}` : item.name,
            city: item.name,
            district: item.region,
            cityId: item.id,
            regionId: item.regionId,
            region: item.region,
            latitude: item.latitude,
            longitude: item.longitude,
          };
        } else {
          // street
          const streetName = item.streetType ? `${item.streetType} ${item.name}` : item.name;
          const formatted = item.city 
            ? `${item.city}, ${streetName}`
            : streetName;
          return {
            text: formatted,
            formatted,
            city: item.city || '',
            street: item.name,
            district: item.region,
            streetId: item.id,
            cityId: item.cityId,
            regionId: item.regionId,
            region: item.region,
            latitude: item.latitude,
            longitude: item.longitude,
          };
        }
      });
      
      return suggestions;
    } catch (error: any) {
      logger.error('Address autocomplete error', {
        error: error?.message || String(error),
        query,
        stack: error?.stack,
      });
      
      // Если ошибка при обращении к provider-service, пробуем локальный поиск
      try {
        logger.info('Coverage service error, falling back to local database search', { query, cityId });
        const localResults = await this.searchLocal(query, cityId);
        
        const suggestions: AddressSuggestion[] = localResults.slice(0, limit).map((item: any) => {
          if (item.type === 'city') {
            return {
              text: item.name,
              formatted: item.region ? `${item.name}, ${item.region}` : item.name,
              city: item.name,
              district: item.region,
              cityId: item.id,
              regionId: item.regionId,
              region: item.region,
              latitude: item.latitude,
              longitude: item.longitude,
            };
          } else {
            const streetName = item.streetType ? `${item.streetType} ${item.name}` : item.name;
            const formatted = item.city 
              ? `${item.city}, ${streetName}`
              : streetName;
            return {
              text: formatted,
              formatted,
              city: item.city || '',
              street: item.name,
              district: item.region,
              streetId: item.id,
              cityId: item.cityId,
              regionId: item.regionId,
              region: item.region,
              latitude: item.latitude,
              longitude: item.longitude,
            };
          }
        });
        
        return suggestions;
      } catch (fallbackError: any) {
        logger.error('Local database search also failed', {
          error: fallbackError?.message || String(fallbackError),
          query,
        });
        // Возвращаем пустой массив вместо ошибки, чтобы не ломать работу приложения
        return [];
      }
    }
  }

  /**
   * Поиск в локальной БД (если адрес уже сохранен)
   * @param query - поисковый запрос
   * @param cityId - опциональный ID города для фильтрации улиц
   */
  async searchLocal(query: string, cityId?: number): Promise<any[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    // Поиск по городам (только если не указан cityId)
    const cities = cityId ? [] : await City.findAll({
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

    // Поиск по улицам (если указан cityId, ищем только в этом городе)
    const streetWhere: any = {
      name: { [Op.iLike]: searchTerm },
    };
    if (cityId) {
      streetWhere.cityId = cityId;
    }

    const streets = await Street.findAll({
      where: streetWhere,
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
        regionId: city.region?.id,
        cityId: city.id,
        latitude: city.latitude,
        longitude: city.longitude,
      })),
      ...streets.map((street) => ({
        type: 'street',
        id: street.id,
        name: street.name,
        city: street.city?.name,
        cityId: street.city?.id,
        region: street.city?.region?.name,
        regionId: street.city?.region?.id,
        streetId: street.id,
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
