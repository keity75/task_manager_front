const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
});

// Jestのカスタム設定
const customJestConfig = {
  // テスト環境
  testEnvironment: 'jest-environment-jsdom',

  // セットアップファイル（setupFilesAfterEnvより前に実行される）
  // jsdom環境で不足するブラウザAPI（TextEncoder, fetch, ReadableStream等）を補完する
  setupFiles: ['<rootDir>/tests/setup-polyfills.ts'],

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // モジュールパスエイリアス（tsconfig.jsonのpathsと一致させる）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // テストファイルのパターン
  testMatch: ['**/tests/**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],

  // カバレッジ収集対象
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/types.ts',
    '!src/**/constants.ts',
    '!src/**/index.ts',
  ],

  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // モジュールの拡張子解決
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

// next/jest が transformIgnorePatterns を上書きするため、
// 非同期設定で後から追加する
module.exports = async () => {
  const jestConfig = await createJestConfig(customJestConfig)();
  return {
    ...jestConfig,
    // ESMモジュールを使用するパッケージを変換対象に含める
    transformIgnorePatterns: ['/node_modules/(?!(until-async|msw|@mswjs)/)'],
  };
};
