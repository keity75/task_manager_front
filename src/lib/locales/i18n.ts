/**
 * @file
 * [i18n Entry Point]
 * * このファイルは、アプリケーション全体で使用する「文言オブジェクト」をエクスポートします。
 * * 将来の多言語化対応では、ここでユーザーの言語設定を判別し、
 * * `ja` や `en` などの適切なロケールオブジェクトをエクスポートするロジックを実装します。
 * * @example
 * import { t } from '@/lib/locales/i18n';
 * // ...
 * <Button>{t.components.header.logout}</Button>
 * z.string().min(1, { message: t.validation.task.title_required })
 */

import { ja } from './ja';

// MVPでは日本語（ja）を 't' (translate) としてエクスポート
export const t = ja;
