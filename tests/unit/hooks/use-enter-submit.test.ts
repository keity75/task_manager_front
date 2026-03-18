/**
 * @file use-enter-submit.test.ts
 * useEnterSubmit フックのテスト
 *
 * テストケース:
 * - Enter キー押下時に onSubmit が呼ばれ、preventDefault が呼ばれる
 * - isDisabled=true の場合 onSubmit は呼ばれない
 * - IME 変換中（isComposing=true）の Enter で onSubmit は呼ばれない
 * - Enter 以外のキーでは onSubmit は呼ばれない
 */

import { renderHook } from '@testing-library/react';
import { useEnterSubmit } from '@/hooks/use-enter-submit';
import { createMockKeyboardEvent } from '../../utils/mock-helpers';

describe('useEnterSubmit', () => {
  /**
   * キーボードイベントをシミュレートするヘルパー関数
   */
  const createKeyboardEvent = (
    key: string,
    options: { isComposing?: boolean } = {}
  ): React.KeyboardEvent<HTMLInputElement> => {
    return createMockKeyboardEvent<HTMLInputElement>({
      key,
      nativeEvent: {
        isComposing: options.isComposing ?? false,
      },
    });
  };

  describe('正常系', () => {
    it('Enter キー押下時に onSubmit が呼ばれ、preventDefault が呼ばれる', () => {
      // Arrange
      const onSubmit = jest.fn();
      const { result } = renderHook(() => useEnterSubmit(onSubmit));
      const event = createKeyboardEvent('Enter');

      // Act
      result.current(event);

      // Assert
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('isDisabled=true の場合 onSubmit は呼ばれない', () => {
      // Arrange
      const onSubmit = jest.fn();
      const { result } = renderHook(() => useEnterSubmit(onSubmit, true));
      const event = createKeyboardEvent('Enter');

      // Act
      result.current(event);

      // Assert
      expect(onSubmit).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('IME 変換中（isComposing=true）の Enter で onSubmit は呼ばれない', () => {
      // Arrange
      const onSubmit = jest.fn();
      const { result } = renderHook(() => useEnterSubmit(onSubmit));
      const event = createKeyboardEvent('Enter', { isComposing: true });

      // Act
      result.current(event);

      // Assert
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('Enter 以外のキーでは onSubmit は呼ばれない', () => {
      // Arrange
      const onSubmit = jest.fn();
      const { result } = renderHook(() => useEnterSubmit(onSubmit));
      const event = createKeyboardEvent('Space');

      // Act
      result.current(event);

      // Assert
      expect(onSubmit).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
