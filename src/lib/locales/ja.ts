/**
 * @file
 * [Locale (ja)]
 * * このファイルは、日本語（ja）のすべての文言を定義する「単一の真実のソース」です。
 * * 1. `validation`: 汎用的なバリデーションルール（関数テンプレート）
 * * 2. `[feature_name]`: 機能ごとの文言（フィールド名、UIラベル）
 */
export const ja = {
  // --- 1. 汎用バリデーションルール ---
  validation: {
    required: (field: string) => `${field}は必須です。`,
    maxLength: (field: string, max: number) => `${field}は${max}文字以内で入力してください。`,
    invalid_format: (field: string) => `有効な${field}形式ではありません。`,
    invalid_selection: (field: string) => `無効な${field}です。`,
  },

  // --- 2. 汎用UI文言 ---
  ui: {
    app_name: 'Task Manager',
    filter: 'フィルター',
    button: {
      cancel: 'キャンセル',
      save: '保存',
      saving: '保存中...',
      update: '更新',
      updating: '更新中...',
      delete: '削除する',
      deleting: '削除中...',
      prev: '前へ',
      next: '次へ',
      close: '閉じる',
      load_more: 'さらに読み込む',
      clear: 'クリア',
      search: '検索',
    },
    placeholder: {
      select: '選択...',
      all: 'すべて',
    },
    error: {
      title: 'エラーが発生しました',
      default_message: '予期せぬエラーが発生しました。',
      retry_button: '再試行',
      dashboard_button: 'ダッシュボードに戻る',
    },
    not_found: {
      title: '404 - ページが見つかりません',
      message: 'お探しのページは見つかりませんでした。',
      dashboard_button: 'ダッシュボードに戻る',
    },
    loading: '読み込み中...',
    loading_more: '読み込み中...',
    action: 'アクション',
    not_set: '未設定',
    error_loading: (feature: string) =>
      `エラーが発生しました。${feature}の読み込みに失敗しました。`,
    no_items: (feature: string) => `${feature}がありません`,
    no_more_items: (feature: string) => `${feature}はこれ以上ありません`,
  },

  // --- 3. メタデータ（ページタイトル・説明） ---
  metadata: {
    app: {
      name: 'Task Manager',
      description: 'Task Managerアプリケーション',
    },
    pages: {
      auth: {
        login: {
          title: 'ログイン',
          description: 'Task Managerアプリケーションへのログインページです。',
        },
      },
      dashboard: {
        title: 'ダッシュボード',
        description: 'ダッシュボードページです。',
      },
      tasks: {
        title: 'タスク管理',
        description: 'タスク管理ページです。',
      },
      emails: {
        title: 'メール管理',
        description: 'メール管理ページです。',
      },
    },
  },

  // --- 3. コンポーネント別文言 ---

  /**
   * ヘッダーコンポーネント関連の文言
   */
  header: {
    user_fallback: 'ユーザー',
    user_fallback_avatar: 'ユ',
    logout: 'ログアウト',
  },

  // --- 4. 機能別文言 ---

  /**
   * タスク機能（tasks）関連の文言
   */
  task: {
    name: 'タスク',
    fields: {
      title: 'タイトル',
      description: '説明',
      dueAt: '日時',
      dueAt_label: '期限', // UI表示用（'日時' ではなく '期限' として表示）
      date_from: '期限（以降）',
      date_to: '期限（以前）',
      priority: '優先度',
      status: 'ステータス',
      created_at: '作成日時',
    },
    ui: {
      page_title: 'タスク管理',
      list_title: 'タスク一覧',
      detail_title: 'タスク詳細',
      create_title: 'タスク作成',
      create_description: '新しいタスクを作成します。必要な情報を入力してください。',
      edit_title: 'タスク編集',
      edit_description: 'タスクの情報を編集します。変更する項目を修正してください。',
      delete_title: 'タスクの削除',
      delete_confirm_message: '本当にこのタスクを削除しますか？',
      delete_warning: 'この操作は元に戻せません。',
      create_button: '+ タスク作成',
      no_description: '説明なし',
      detail_info: '詳細情報',
      status_placeholder: 'ステータス...',
      sort_by: '並び替え',
      total_count: (count: number) => `全 ${count} 件`,
      current_page: (current: number, total: number) => `${current} / ${total} ページ`,
      placeholder: {
        title: 'タスクのタイトルを入力',
        description: 'タスクの説明を入力',
      },
      toast: {
        create_success_title: 'タスク作成成功',
        create_success_description: 'タスクが正常に作成されました',
        create_error_title: 'タスク作成失敗',
        create_error_description: 'タスクの作成に失敗しました',

        update_success_title: 'タスク更新成功',
        update_success_description: 'タスクが正常に更新されました',
        update_error_title: 'タスク更新失敗',
        update_error_description: 'タスクの更新に失敗しました',

        delete_success_title: 'タスク削除成功',
        delete_success_description: 'タスクが正常に削除されました',
        delete_error_title: 'タスク削除失敗',
        delete_error_description: 'タスクの削除に失敗しました',

        extract_success_title: 'タスク抽出成功',
        extract_success_description: 'タスクの抽出が完了しました',
        extract_error_title: 'タスク抽出失敗',
        extract_error_description: 'タスクの抽出に失敗しました',
      },
    },
    labels: {
      priority: {
        urgent: '緊急',
        high: '高',
        medium: '中',
        low: '低',
        unknown: '不明',
      },
      status: {
        todo: '未着手',
        in_progress: '処理中',
        done: '完了',
        unknown: '不明',
      },
    },
  },

  /**
   * メール機能（emails）関連の文言
   */
  email: {
    name: 'メール',
    fields: {
      subject: '件名',
      from: '送信者',
      date_from: '開始日',
      date_to: '終了日',
      received_at: '受信日時',
      body: 'メール本文',
    },
    ui: {
      page_title: 'メール管理',
      list_title: 'メール一覧',
      recent_list_title: '最新メール一覧',
      detail_title: 'メール詳細',
      detail_description: 'メールの内容を確認し、返信文案を生成できます。',
      body_unavailable: '（本文は現在読み込めません）',
      reply_generation_title: '返信文案生成',
      reply_generation_button: '返信文案生成',
      generating: '生成中...',
      copy_text: 'テキストコピー',
      copied: 'コピーしました',
      date_range: '日付範囲',
      sort_order: '並び順',
      sort_newest: '新着順',
      sort_oldest: '古い順',
      toast: {
        reply_error_title: '返信文案生成に失敗しました',
        reply_error_description: 'しばらく待ってから再度お試しください',
      },
    },
  },

  /**
   * ダッシュボード機能関連の文言
   */
  dashboard: {
    stats: {
      total_tasks: 'タスク総数',
      todo_tasks: '未着手タスク',
      in_progress_tasks: '処理中タスク',
      completed_tasks: '完了タスク',
    },
  },

  /**
   * 認証機能関連の文言
   */
  auth: {
    login: {
      button: 'Googleでログイン',
      logging_in: 'ログイン中...',
      terms_message:
        'ログインを続けることで、利用規約およびプライバシーポリシーに同意したものとみなされます。',
      terms_of_service: '利用規約',
      privacy_policy: 'プライバシーポリシー',
      error_auth_failed: '認証に失敗しました。もう一度お試しください。',
      error_unexpected: '予期しないエラーが発生しました。もう一度お試しください。',
      error_access_denied: '認証がキャンセルされました。再度ログインをお試しください。',
    },
  },

  /**
   * ナビゲーション関連の文言
   */
  navigation: {
    dashboard: 'ダッシュボード',
    emails: 'メール管理',
    tasks: 'タスク管理',
  },

  /**
   * APIエラー関連の文言
   */
  api: {
    error: {
      timeout: (seconds: number) => `リクエストがタイムアウトしました（${seconds}秒）`,
      network: 'ネットワークエラーが発生しました',
      unauthorized: 'セッションの有効期限が切れました。',
      invalid_response: (preview: string) => `無効なレスポンス形式: ${preview}`,
      provider_permission_revoked:
        'アカウントの権限が解除されました。再度ログインして権限を付与してください。',
      auth_token_missing: '認証情報が見つかりません。再度ログインしてください。',
      token_refresh_failed: 'セッションの更新に失敗しました。再度ログインしてください。',
    },
  },
} as const;
