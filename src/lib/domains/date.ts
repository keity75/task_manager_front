/**
 * @file
 * [Domain Utility (Date)]
 * * このファイルは、「日付」というドメイン（ビジネスロジック）に関連する
 * 純粋なユーティリティ関数を提供します。
 * (date-fnsをラップした関数群)
 * * @see lib/domains/tasks.ts (タスク機能固有のutils)
 * @see app/(workspace)/tasks/_hooks/useTasks.ts (Reactフック)
 * @see app/(workspace)/tasks/actions.ts (Server Actions)
 */

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * UTC日付文字列（ISO形式）をJST（日本標準時）の指定フォーマットに変換する
 *
 * @param utcDateString - UTC日付文字列（ISO 8601形式: "2025-10-31T05:30:00Z"）
 * @param formatString - 出力フォーマット（date-fnsのフォーマット文字列）
 * @returns フォーマットされた日付文字列
 *
 * @example
 * formatUtcToJst('2025-10-31T05:30:00Z', 'yyyy年MM月dd日') // "2025年10月31日"
 * formatUtcToJst('2025-10-31T05:30:00Z', 'HH:mm') // "14:30"
 * formatUtcToJst('2025-10-31T05:30:00Z', 'yyyy/MM/dd HH:mm') // "2025/10/31 14:30"
 */
export function formatUtcToJst(utcDateString: string, formatString: string): string {
  try {
    // UTC文字列をDateオブジェクトに変換
    const utcDate = parseISO(utcDateString);

    // JST（Asia/Tokyo）に変換
    const jstDate = toZonedTime(utcDate, 'Asia/Tokyo');

    // 指定されたフォーマットで日付を文字列化
    return format(jstDate, formatString, { locale: ja });
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return '';
  }
}

/**
 * ローカル日時文字列をタイムゾーン情報付きISO 8601文字列に変換する
 *
 * この関数はブラウザのタイムゾーン設定に依存せず、指定したタイムゾーンで
 * 日時を解釈し、タイムゾーン情報を含むISO 8601形式の文字列を返します。
 *
 * @param dateTimeString - ローカル日時文字列 (例: "2025-01-20T15:00")
 * @param timezone - タイムゾーン (デフォルト: "Asia/Tokyo")
 * @returns タイムゾーン付きISO 8601文字列 (例: "2025-01-20T15:00:00+09:00")。無効な入力の場合は null。
 */
export function convertToIsoWithTimezone(
  dateTimeString: string | null | undefined,
  timezone: string = 'Asia/Tokyo'
): string | null {
  if (!dateTimeString) {
    return null;
  }

  try {
    // タイムゾーン情報を付けてISO文字列にフォーマット
    // formatInTimeZoneは指定したタイムゾーンで日時を解釈する
    const isoString = formatInTimeZone(dateTimeString, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX");

    return isoString;
  } catch (error) {
    console.error('Timezone conversion error:', error);
    return null;
  }
}
