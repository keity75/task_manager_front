/**
 * ポリフィル設定ファイル
 * jsdom環境で不足するブラウザAPIを補完する
 * 他のモジュールより先に実行される必要がある
 */

import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill';
// fetch, Request, Response, Headers を globalThis に設定する
import 'whatwg-fetch';

// TextEncoder/TextDecoder を globalThis に設定
// MSW がこれらを必要とする
Object.assign(globalThis, { TextEncoder, TextDecoder });

// Web Streams API を globalThis に設定
// MSW v2 がこれらを必要とする
Object.assign(globalThis, { ReadableStream, WritableStream, TransformStream });

// BroadcastChannel を globalThis に設定
// MSW v2 のWebSocket対応で必要とされる
// Jest環境用のシンプルなモック実装
class BroadcastChannelMock {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage(): void {
    // テスト環境では何もしない
  }

  close(): void {
    // テスト環境では何もしない
  }

  addEventListener(): void {
    // テスト環境では何もしない
  }

  removeEventListener(): void {
    // テスト環境では何もしない
  }
}

Object.assign(globalThis, { BroadcastChannel: BroadcastChannelMock });
