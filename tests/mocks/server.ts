/**
 * MSWサーバー設定
 * テスト環境でAPIリクエストをインターセプトするためのMSWサーバーインスタンス
 */

import { setupServer } from 'msw/node';

export const server = setupServer();
