import React from "react";
import { PiGreaterThanBold, PiLessThanBold } from "react-icons/pi";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const getPageNumbers = (page: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (page <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }
  if (page >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  className,
}) => {
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:text-white disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <PiLessThanBold size={16} />
      </button>
      {pageNumbers.map((p, i) =>
        typeof p === "number" ? (
          <button
            key={i}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
              p === page
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-zinc-100 text-zinc-700 dark:text-white"
            } font-medium`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ) : (
          <span
            key={i}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 dark:text-white "
          >
            {p}
          </span>
        )
      )}
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 disabled:opacity-50 dark:text-white"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <PiGreaterThanBold size={16} />
      </button>
    </div>
  );
};

export default Pagination;
