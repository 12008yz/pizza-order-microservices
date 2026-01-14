import {
  normalizeCity,
  normalizeStreet,
  normalizeDistrict,
  createSearchPattern,
} from '../../utils/addressNormalizer';

describe('addressNormalizer', () => {
  describe('normalizeCity', () => {
    it('should normalize city with "г." prefix', () => {
      expect(normalizeCity('г. Москва')).toBe('москва');
      expect(normalizeCity('г.Москва')).toBe('москва');
      expect(normalizeCity('г Москва')).toBe('москва');
    });

    it('should normalize city with "город" prefix', () => {
      expect(normalizeCity('город Москва')).toBe('москва');
      expect(normalizeCity('Город Санкт-Петербург')).toBe('санкт-петербург');
    });

    it('should remove leading and trailing spaces', () => {
      expect(normalizeCity('  Москва  ')).toBe('москва');
      expect(normalizeCity('Москва ')).toBe('москва');
      expect(normalizeCity(' Москва')).toBe('москва');
    });

    it('should normalize multiple spaces to single space', () => {
      expect(normalizeCity('Санкт   Петербург')).toBe('санкт петербург');
      expect(normalizeCity('Новый    Уренгой')).toBe('новый уренгой');
    });

    it('should convert to lowercase', () => {
      expect(normalizeCity('МОСКВА')).toBe('москва');
      expect(normalizeCity('Санкт-Петербург')).toBe('санкт-петербург');
      expect(normalizeCity('Казань')).toBe('казань');
    });

    it('should handle empty string', () => {
      expect(normalizeCity('')).toBe('');
    });

    it('should handle already normalized city', () => {
      expect(normalizeCity('москва')).toBe('москва');
      expect(normalizeCity('санкт-петербург')).toBe('санкт-петербург');
    });

    it('should handle city with hyphen', () => {
      expect(normalizeCity('Санкт-Петербург')).toBe('санкт-петербург');
      expect(normalizeCity('Ростов-на-Дону')).toBe('ростов-на-дону');
    });

    it('should handle complex city names', () => {
      expect(normalizeCity('г. Новый Уренгой')).toBe('новый уренгой');
      expect(normalizeCity('город Нижний Новгород')).toBe('нижний новгород');
    });

    it('should remove "и" from compound names', () => {
      expect(normalizeCity('Санкт и Петербург')).toBe('санкт петербург');
    });

    it('should handle edge cases', () => {
      expect(normalizeCity('   ')).toBe('');
      expect(normalizeCity('г.')).toBe('');
      expect(normalizeCity('город')).toBe('');
    });
  });

  describe('normalizeStreet', () => {
    it('should normalize street with "ул." prefix', () => {
      expect(normalizeStreet('ул. Тверская')).toBe('тверская');
      expect(normalizeStreet('ул.Тверская')).toBe('тверская');
      expect(normalizeStreet('ул Тверская')).toBe('тверская');
    });

    it('should normalize street with "улица" prefix', () => {
      expect(normalizeStreet('улица Тверская')).toBe('тверская');
      expect(normalizeStreet('Улица Ленина')).toBe('ленина');
    });

    it('should normalize street with "проспект" prefix', () => {
      expect(normalizeStreet('проспект Ленина')).toBe('ленина');
      expect(normalizeStreet('пр. Мира')).toBe('мира');
      expect(normalizeStreet('пр Мира')).toBe('мира');
    });

    it('should normalize street with "переулок" prefix', () => {
      expect(normalizeStreet('переулок Арбатский')).toBe('арбатский');
      expect(normalizeStreet('пер. Арбатский')).toBe('арбатский');
      expect(normalizeStreet('пер Арбатский')).toBe('арбатский');
    });

    it('should normalize street with "бульвар" prefix', () => {
      expect(normalizeStreet('бульвар Тверской')).toBe('тверской');
      expect(normalizeStreet('бул. Тверской')).toBe('тверской');
      expect(normalizeStreet('бул Тверской')).toBe('тверской');
    });

    it('should normalize street with "площадь" prefix', () => {
      expect(normalizeStreet('площадь Красная')).toBe('красная');
      expect(normalizeStreet('пл. Красная')).toBe('красная');
      expect(normalizeStreet('пл Красная')).toBe('красная');
    });

    it('should normalize street with "набережная" prefix', () => {
      expect(normalizeStreet('набережная Невы')).toBe('невы');
      expect(normalizeStreet('наб. Невы')).toBe('невы');
      expect(normalizeStreet('наб Невы')).toBe('невы');
    });

    it('should normalize street with "шоссе" prefix', () => {
      expect(normalizeStreet('шоссе Энтузиастов')).toBe('энтузиастов');
      expect(normalizeStreet('ш. Энтузиастов')).toBe('энтузиастов');
      expect(normalizeStreet('ш Энтузиастов')).toBe('энтузиастов');
    });

    it('should normalize street with "тупик" prefix', () => {
      expect(normalizeStreet('тупик Слепой')).toBe('слепой');
      expect(normalizeStreet('туп. Слепой')).toBe('слепой');
      expect(normalizeStreet('туп Слепой')).toBe('слепой');
    });

    it('should normalize street with suffix', () => {
      expect(normalizeStreet('Тверская ул.')).toBe('тверская');
      expect(normalizeStreet('Тверская улица')).toBe('тверская');
      expect(normalizeStreet('Ленина проспект')).toBe('ленина');
      expect(normalizeStreet('Мира пр.')).toBe('мира');
    });

    it('should handle street without type', () => {
      expect(normalizeStreet('Тверская')).toBe('тверская');
      expect(normalizeStreet('Ленина')).toBe('ленина');
    });

    it('should remove leading and trailing spaces', () => {
      expect(normalizeStreet('  Тверская  ')).toBe('тверская');
      expect(normalizeStreet(' ул. Тверская ')).toBe('тверская');
    });

    it('should normalize multiple spaces', () => {
      expect(normalizeStreet('Тверская   улица')).toBe('тверская');
      expect(normalizeStreet('ул.   Тверская')).toBe('тверская');
    });

    it('should convert to lowercase', () => {
      expect(normalizeStreet('ТВЕРСКАЯ')).toBe('тверская');
      expect(normalizeStreet('УЛ. ЛЕНИНА')).toBe('ленина');
    });

    it('should return null for null input', () => {
      expect(normalizeStreet(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(normalizeStreet(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(normalizeStreet('')).toBeNull();
    });

    it('should handle street with hyphen', () => {
      expect(normalizeStreet('ул. Ново-Тверская')).toBe('ново-тверская');
      expect(normalizeStreet('проспект Ленина-Свердлова')).toBe('ленина-свердлова');
    });

    it('should handle complex street names', () => {
      expect(normalizeStreet('улица Большая Тверская')).toBe('большая тверская');
      expect(normalizeStreet('проспект Мира и Дружбы')).toBe('мира и дружбы');
    });

    it('should handle edge cases', () => {
      expect(normalizeStreet('   ')).toBeNull();
      expect(normalizeStreet('ул.')).toBeNull();
      expect(normalizeStreet('улица')).toBeNull();
    });

    it('should handle street with both prefix and suffix', () => {
      expect(normalizeStreet('ул. Тверская ул.')).toBe('тверская');
      expect(normalizeStreet('проспект Ленина пр.')).toBe('ленина');
    });
  });

  describe('normalizeDistrict', () => {
    it('should normalize district with "район" prefix', () => {
      expect(normalizeDistrict('район Центральный')).toBe('центральный');
      expect(normalizeDistrict('Район Северный')).toBe('северный');
    });

    it('should remove leading and trailing spaces', () => {
      expect(normalizeDistrict('  Центральный  ')).toBe('центральный');
      expect(normalizeDistrict(' Центральный ')).toBe('центральный');
    });

    it('should normalize multiple spaces', () => {
      expect(normalizeDistrict('Центральный   район')).toBe('центральный район');
      expect(normalizeDistrict('Северный    административный')).toBe('северный административный');
    });

    it('should convert to lowercase', () => {
      expect(normalizeDistrict('ЦЕНТРАЛЬНЫЙ')).toBe('центральный');
      expect(normalizeDistrict('Северный')).toBe('северный');
    });

    it('should return null for null input', () => {
      expect(normalizeDistrict(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(normalizeDistrict(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(normalizeDistrict('')).toBeNull();
    });

    it('should handle district without prefix', () => {
      expect(normalizeDistrict('Центральный')).toBe('центральный');
      expect(normalizeDistrict('Северный')).toBe('северный');
    });

    it('should handle complex district names', () => {
      expect(normalizeDistrict('район Центральный административный')).toBe('центральный административный');
      expect(normalizeDistrict('Северный административный округ')).toBe('северный административный округ');
    });

    it('should handle edge cases', () => {
      expect(normalizeDistrict('   ')).toBeNull();
      expect(normalizeDistrict('район')).toBeNull();
    });
  });

  describe('createSearchPattern', () => {
    it('should create search pattern from city name', () => {
      expect(createSearchPattern('Москва')).toBe('москва');
      expect(createSearchPattern('г. Москва')).toBe('москва');
      expect(createSearchPattern('Санкт-Петербург')).toBe('санкт-петербург');
    });

    it('should normalize input before creating pattern', () => {
      expect(createSearchPattern('  Москва  ')).toBe('москва');
      expect(createSearchPattern('ГОРОД МОСКВА')).toBe('москва');
    });

    it('should handle empty string', () => {
      expect(createSearchPattern('')).toBe('');
    });

    it('should handle complex city names', () => {
      expect(createSearchPattern('г. Новый Уренгой')).toBe('новый уренгой');
      expect(createSearchPattern('Ростов-на-Дону')).toBe('ростов-на-дону');
    });
  });
});
