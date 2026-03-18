import { useCallback } from 'react';

export function useEnterSubmit(onSubmit: () => void, isDisabled: boolean = false) {
  return useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // IME変換中のEnterは無視する (日本語入力対応)
      if (e.nativeEvent.isComposing) return;

      if (e.key === 'Enter' && !isDisabled) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit, isDisabled]
  );
}
