import * as React from 'react';
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/atoms';

const DEFAULT_SIBLING_COUNT = 1;
const DEFAULT_DISPLAY_LIMIT = 7;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = DEFAULT_SIBLING_COUNT,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const pages = generatePaginationItems(currentPage, totalPages, siblingCount);

  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <PaginationItem key={`dots-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                href='#'
                isActive={currentPage === page}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  onPageChange(page as number);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href='#'
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}

/**
 * スライディングウィンドウロジックを使用してページネーション項目を生成するヘルパー関数
 *
 * 例: totalPages=10, currentPage=5, siblingCount=1 の場合
 * [1, "...", 4, 5, 6, "...", 10] を生成する
 */
function generatePaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | string)[] {
  // 表示するページ番号の最大数（これ以下の場合は全て表示）
  const displayLimit = DEFAULT_DISPLAY_LIMIT + (siblingCount - DEFAULT_SIBLING_COUNT) * 2;

  // 総ページ数が表示限界以下の場合は、単純に全ページを表示
  // 例: [1, 2, 3, 4, 5]
  if (totalPages <= displayLimit) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 現在のページの左右にある兄弟ページの範囲を計算
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  // ドット（...）を表示すべきかどうかを判定
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  // ケース1: 右側のみドットを表示（左側は1ページ目から連続）
  // 例: [1, 2, 3, 4, 5, "...", 10] (currentPage=3, sibling=1)
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', totalPages];
  }

  // ケース2: 左側のみドットを表示（右側は最後ページまで連続）
  // 例: [1, "...", 6, 7, 8, 9, 10] (currentPage=8, sibling=1)
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, '...', ...rightRange];
  }

  // ケース3: 両側にドットを表示（中間に位置する）
  // 例: [1, "...", 4, 5, 6, "...", 10] (currentPage=5, sibling=1)
  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, '...', ...middleRange, '...', totalPages];
}
