export interface Email {
  id: string;
  subject: string;
  from: string;
  receivedAt: string; // UTC ISO 8601
}

export interface EmailDetail extends Email {
  body: string; // プレーンテキスト（改行は\n）
}

export interface GetEmailsResponse {
  emails: Email[];
  totalCount: number;
}

// フィルター関連の型定義
export interface EmailFilterValues {
  subject: string;
  from: string;
  dateFrom: string | null;
  dateTo: string | null;
}

export type EmailFilterField = keyof EmailFilterValues;

export interface EmailFilterHandlers {
  onFilterChange: (field: EmailFilterField, value: string | null) => void;
  onSearchClick: () => void;
  onClearClick: () => void;
}

export interface EmailPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
