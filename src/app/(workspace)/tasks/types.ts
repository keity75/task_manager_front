export interface Task {
  id: string;
  title: string;
  status: number; // 10: todo, 20: in_progress, 30: done
  priority: number; // 4: urgent, 3: high, 2: medium, 1: low
  dueAt: string | null; // UTC ISO 8601 or null
  description: string | null;
  calendarLink: string | null;
  userId: string;
  createdAt: string; // UTC ISO 8601
  updatedAt: string; // UTC ISO 8601
  deletedAt: string | null;
}

export type SortKey = 'dueAt' | 'priority' | 'status' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface GetTasksResponse {
  tasks: Task[];
  totalCount: number;
}

// フィルター関連の型定義
export interface TaskFilterValues {
  title: string;
  dateFrom: string | null;
  dateTo: string | null;
  priorities: number[]; // 複数選択可能
  statuses: number[]; // 複数選択可能
}

export type TaskFilterField = keyof TaskFilterValues;

export interface TaskFilterHandlers {
  onFilterChange: (field: TaskFilterField, value: string | null | number[]) => void;
  onSearchClick: () => void;
  onClearClick: () => void;
}

export interface TaskSortProps {
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSortChange: (key: SortKey) => void;
}

export interface TaskPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// タスク集計レスポンス
export interface TaskSummaryResponse {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}
