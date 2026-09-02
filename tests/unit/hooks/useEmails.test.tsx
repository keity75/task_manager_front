/**
 * @file useEmails.test.tsx
 * メール関連フックの単体テスト
 */

import { waitFor } from '@testing-library/react';
import { renderHookWithProviders, createTestQueryClient } from '../../utils/render';

jest.mock('@/app/(workspace)/emails/actions', () => ({
  getEmails: jest.fn(),
}));

import { useEmailsQuery } from '@/app/(workspace)/emails/_hooks/useEmails';
import { getEmails } from '@/app/(workspace)/emails/actions';

const mockGetEmails = getEmails as jest.MockedFunction<typeof getEmails>;

const mockEmail = {
  id: 'email-1',
  subject: 'テストメール',
  from: 'tanaka@example.com',
  receivedAt: '2026-03-10T01:20:00Z',
  body: '本文です。',
};

describe('useEmailsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('API成功時にメール一覧と総件数が返る', async () => {
      // Arrange
      mockGetEmails.mockResolvedValue({ emails: [mockEmail], totalCount: 1 });

      // Act
      const { result } = renderHookWithProviders(() =>
        useEmailsQuery({ page: 1, limit: 10 })
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.emails).toEqual([mockEmail]);
      expect(result.current.totalCount).toBe(1);
      expect(result.current.isError).toBe(false);
    });

    it('空文字列のフィルタはundefinedに正規化されてgetEmailsへ渡される', async () => {
      // Arrange
      mockGetEmails.mockResolvedValue({ emails: [], totalCount: 0 });

      // Act
      renderHookWithProviders(() =>
        useEmailsQuery({ page: 1, limit: 10, subject: '', from: '', dateFrom: null, dateTo: null })
      );

      // Assert
      await waitFor(() => {
        expect(mockGetEmails).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          subject: undefined,
          from: undefined,
          dateFrom: undefined,
          dateTo: undefined,
        });
      });
    });

    it('指定したフィルタ条件がそのままgetEmailsへ渡される', async () => {
      // Arrange
      mockGetEmails.mockResolvedValue({ emails: [], totalCount: 0 });

      // Act
      renderHookWithProviders(() =>
        useEmailsQuery({
          page: 2,
          limit: 10,
          subject: '会議',
          from: 'tanaka@example.com',
          dateFrom: '2026-03-01',
          dateTo: '2026-03-31',
        })
      );

      // Assert
      await waitFor(() => {
        expect(mockGetEmails).toHaveBeenCalledWith({
          page: 2,
          limit: 10,
          subject: '会議',
          from: 'tanaka@example.com',
          dateFrom: '2026-03-01',
          dateTo: '2026-03-31',
        });
      });
    });

    it('refetchを呼ぶとgetEmailsが再度呼ばれる', async () => {
      // Arrange
      mockGetEmails.mockResolvedValue({ emails: [mockEmail], totalCount: 1 });
      const queryClient = createTestQueryClient();
      const { result } = renderHookWithProviders(() => useEmailsQuery({ page: 1, limit: 10 }), {
        queryClient,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockGetEmails).toHaveBeenCalledTimes(1);

      // Act
      await result.current.refetch();

      // Assert
      expect(mockGetEmails).toHaveBeenCalledTimes(2);
    });
  });

  describe('異常系', () => {
    it('API失敗時にisErrorがtrueになり、一覧は空配列になる', async () => {
      // Arrange
      mockGetEmails.mockRejectedValue(new Error('API error'));
      const queryClient = createTestQueryClient();
      queryClient.setDefaultOptions({ queries: { retry: false } });

      // Act
      const { result } = renderHookWithProviders(() => useEmailsQuery({ page: 1, limit: 10 }), {
        queryClient,
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.emails).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });
  });
});
