/**
 * Jestセットアップファイル
 * テスト実行前に実行される共通設定
 */

import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { server } from './mocks/server';

// jest-axeマッチャーの登録
expect.extend(toHaveNoViolations);

// MSWサーバーのライフサイクル管理
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Next.js関連のグローバルモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    entries: jest.fn(() => []),
    forEach: jest.fn(),
    sort: jest.fn(),
    toString: jest.fn(() => ''),
  })),
}));

// NextAuth.jsのモック
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
      backendAccessToken: 'test-backend-token',
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
