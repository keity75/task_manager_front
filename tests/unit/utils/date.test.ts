/**
 * 日付ユーティリティ関数のテスト
 * @see src/lib/domains/date.ts
 */

jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    format: jest.fn(actual.format),
  };
});

jest.mock('date-fns-tz', () => {
  const actual = jest.requireActual('date-fns-tz');
  return {
    ...actual,
    formatInTimeZone: jest.fn(actual.formatInTimeZone),
  };
});

import { formatUtcToJst, convertToIsoWithTimezone } from '@/lib/domains/date';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const mockFormat = format as jest.MockedFunction<typeof format>;
const mockFormatInTimeZone = formatInTimeZone as jest.MockedFunction<typeof formatInTimeZone>;

describe('date utilities', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('formatUtcToJst', () => {
    describe('正常系', () => {
      it('UTC文字列を指定フォーマットでJST変換する', () => {
        const utcDate = '2025-01-28T10:00:00Z'; // UTC 10:00
        const result = formatUtcToJst(utcDate, 'yyyy年MM月dd日');
        expect(result).toBe('2025年01月28日');
      });

      it('日本語ロケールで正しくフォーマットする', () => {
        const utcDate = '2025-01-28T10:00:00Z';
        const result = formatUtcToJst(utcDate, 'yyyy/MM/dd HH:mm');
        // JSTはUTC+9なので、10:00 UTC = 19:00 JST
        expect(result).toBe('2025/01/28 19:00');
      });
    });

    describe('異常系', () => {
      it('不正な日付文字列で空文字を返す', () => {
        const invalidDate = 'invalid-date-string';
        const result = formatUtcToJst(invalidDate, 'yyyy-MM-dd');
        expect(result).toBe('');
      });

      it('空文字列で空文字を返す', () => {
        const result = formatUtcToJst('', 'yyyy-MM-dd');
        expect(result).toBe('');
      });

      it('想定外エラーが発生した場合は空文字を返す', () => {
        mockFormat.mockImplementationOnce(() => {
          throw new Error('unexpected error');
        });

        const result = formatUtcToJst('2025-01-28T10:00:00Z', 'yyyy-MM-dd');
        expect(result).toBe('');
      });
    });
  });

  describe('convertToIsoWithTimezone', () => {
    describe('正常系', () => {
      it('ローカル日時をタイムゾーン付きISOに変換する', () => {
        const dateTimeString = '2025-01-28T15:00';
        const result = convertToIsoWithTimezone(dateTimeString, 'Asia/Tokyo');
        expect(result).toMatch(/2025-01-28T15:00:00\+09:00/);
      });
    });

    describe('異常系', () => {
      it('nullでnullを返す', () => {
        const result = convertToIsoWithTimezone(null);
        expect(result).toBeNull();
      });

      it('undefinedでnullを返す', () => {
        const result = convertToIsoWithTimezone(undefined);
        expect(result).toBeNull();
      });

      it('空文字列でnullを返す', () => {
        const result = convertToIsoWithTimezone('');
        expect(result).toBeNull();
      });

      it('不正な日付形式でnullを返す', () => {
        const invalidDate = 'invalid-date';
        const result = convertToIsoWithTimezone(invalidDate);
        expect(result).toBeNull();
      });

      it('想定外エラーが発生した場合はnullを返す', () => {
        mockFormatInTimeZone.mockImplementationOnce(() => {
          throw new Error('unexpected error');
        });

        const result = convertToIsoWithTimezone('2025-01-28T15:00');
        expect(result).toBeNull();
      });
    });
  });
});
