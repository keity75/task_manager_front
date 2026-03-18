/**
 * @file use-media-query.test.ts
 * useMediaQuery, useIsMobile, useIsTablet, useIsDesktop フックのテスト
 *
 * テストケース:
 * - マッチする場合 true を返す
 * - マッチしない場合 false を返す
 * - change イベントで値が更新される
 * - useIsMobile は "(max-width: 767px)" を渡す
 * - useIsTablet は "(min-width: 768px) and (max-width: 1023px)" を渡す
 * - useIsDesktop は "(min-width: 1024px)" を渡す
 */

import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/use-media-query';

/**
 * window.matchMedia のモックを作成するヘルパー
 */
interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((event: MediaQueryListEvent) => void) | null;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  dispatchEvent: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  _listeners: Array<(event: MediaQueryListEvent) => void>;
  _triggerChange: (matches: boolean) => void;
}

function createMatchMediaMock(initialMatches: boolean): jest.Mock<MockMediaQueryList, [string]> {
  return jest.fn().mockImplementation((query: string) => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];

    const mediaQueryList: MockMediaQueryList = {
      matches: initialMatches,
      media: query,
      onchange: null,
      addEventListener: jest.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners.push(listener);
        }
      }),
      removeEventListener: jest.fn(
        (event: string, listener: (event: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            const index = listeners.indexOf(listener);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }
        }
      ),
      dispatchEvent: jest.fn(),
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      _listeners: listeners,
      _triggerChange: (newMatches: boolean) => {
        mediaQueryList.matches = newMatches;
        listeners.forEach((listener) => {
          listener({ matches: newMatches } as MediaQueryListEvent);
        });
      },
    };

    return mediaQueryList;
  });
}

describe('useMediaQuery', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  describe('正常系', () => {
    it('マッチする場合 true を返す', () => {
      // Arrange
      window.matchMedia = createMatchMediaMock(true);

      // Act
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      // Assert
      expect(result.current).toBe(true);
    });

    it('マッチしない場合 false を返す', () => {
      // Arrange
      window.matchMedia = createMatchMediaMock(false);

      // Act
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      // Assert
      expect(result.current).toBe(false);
    });

    it('change イベントで値が更新される', () => {
      // Arrange
      const mockMatchMedia = createMatchMediaMock(false);
      window.matchMedia = mockMatchMedia;

      // Act
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      // Assert: 初期値は false
      expect(result.current).toBe(false);

      // Act: change イベントをトリガー
      const mediaQueryList = mockMatchMedia.mock.results[0].value as MockMediaQueryList;
      act(() => {
        mediaQueryList._triggerChange(true);
      });

      // Assert: 値が更新される
      expect(result.current).toBe(true);
    });
  });
});

describe('useIsMobile', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('\"(max-width: 767px)\" を useMediaQuery に渡す', () => {
    // Arrange
    const mockMatchMedia = createMatchMediaMock(true);
    window.matchMedia = mockMatchMedia;

    // Act
    renderHook(() => useIsMobile());

    // Assert
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });
});

describe('useIsTablet', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('\"(min-width: 768px) and (max-width: 1023px)\" を useMediaQuery に渡す', () => {
    // Arrange
    const mockMatchMedia = createMatchMediaMock(true);
    window.matchMedia = mockMatchMedia;

    // Act
    renderHook(() => useIsTablet());

    // Assert
    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px) and (max-width: 1023px)');
  });
});

describe('useIsDesktop', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('\"(min-width: 1024px)\" を useMediaQuery に渡す', () => {
    // Arrange
    const mockMatchMedia = createMatchMediaMock(true);
    window.matchMedia = mockMatchMedia;

    // Act
    renderHook(() => useIsDesktop());

    // Assert
    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });
});
