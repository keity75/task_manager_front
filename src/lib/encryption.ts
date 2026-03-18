/**
 * トークン暗号化ユーティリティ
 *
 * Google OAuth2のアクセストークンとリフレッシュトークンを暗号化/復号化するためのユーティリティ関数
 * AES-256-GCMアルゴリズムを使用し、認証タグによる改ざん検出を実装
 *
 * @module lib/encryption
 */

import crypto from 'crypto';

/**
 * 暗号化アルゴリズム
 */
const ALGORITHM = 'aes-256-gcm';

/**
 * 暗号化キー（環境変数から取得）
 * 32バイト（256ビット）のhex文字列として保存されている想定
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * 追加認証データ（AAD）
 * トークンの種類を識別するための固定値
 */
const AAD = Buffer.from('auth-token', 'utf8');

/**
 * 環境変数チェック
 */
if (!ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY environment variable is not set. Please set it in your .env file.'
  );
}

/**
 * 暗号化キーをBufferに変換
 * hex文字列（64文字）を32バイトのBufferに変換
 */
const getEncryptionKeyBuffer = (): Buffer => {
  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 characters (32 bytes) long hex string.');
  }
  return Buffer.from(ENCRYPTION_KEY, 'hex');
};

/**
 * テキストを暗号化
 *
 * @param text - 暗号化するテキスト
 * @returns 暗号化されたデータ（形式: `iv:authTag:encrypted`）
 * @throws {Error} 暗号化に失敗した場合
 *
 * @example
 * const encrypted = encrypt('sensitive-token');
 * // Returns: "a1b2c3...:d4e5f6...:g7h8i9..."
 */
export function encrypt(text: string): string {
  try {
    // 初期化ベクトル（IV）を生成（16バイト）
    const iv = crypto.randomBytes(16);

    // 暗号化キーを取得
    const key = getEncryptionKeyBuffer();

    // 暗号化器を作成
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // 追加認証データ（AAD）を設定
    cipher.setAAD(AAD);

    // 暗号化を実行
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 認証タグを取得
    const authTag = cipher.getAuthTag();

    // IV、認証タグ、暗号化データを`:`区切りで結合
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 暗号化されたデータを復号化
 *
 * @param encryptedData - 暗号化されたデータ（形式: `iv:authTag:encrypted`）
 * @returns 復号化されたテキスト
 * @throws {Error} 復号化に失敗した場合（データが不正、改ざん検出など）
 *
 * @example
 * const decrypted = decrypt('a1b2c3...:d4e5f6...:g7h8i9...');
 * // Returns: "sensitive-token"
 */
export function decrypt(encryptedData: string): string {
  try {
    // データを分割
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format. Expected format: iv:authTag:encrypted');
    }

    const [ivHex, authTagHex, encrypted] = parts;

    // IVと認証タグをBufferに変換
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // 暗号化キーを取得
    const key = getEncryptionKeyBuffer();

    // 復号化器を作成
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // 追加認証データ（AAD）を設定
    decipher.setAAD(AAD);

    // 認証タグを設定
    decipher.setAuthTag(authTag);

    // 復号化を実行
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unsupported state')) {
      throw new Error(
        'Decryption failed: Authentication tag verification failed. Data may have been tampered with.'
      );
    }
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
