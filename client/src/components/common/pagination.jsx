
import React from "react";

export default function Pagination({ pagination, onPageChange }) {
  const limit = 10;

  const currentPage = Number(pagination?.currentPage) || 1;

  const totalLeads = Number(
    pagination?.totalLeads ?? pagination?.totalItems ?? 0
  );

  const totalPage = Number(
    pagination?.totalPage ??
    pagination?.totalPages ??
    Math.ceil(totalLeads / limit)
  );

  if (totalLeads <= limit || totalPage <= 1) return null;

  const startLead = (currentPage - 1) * limit + 1;
  const endLead = Math.min(currentPage * limit, totalLeads);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      <p className="text-sm text-gray-600">
        Showing <strong>{startLead}-{endLead}</strong> of{" "}
        <strong>{totalLeads}</strong> Leads
      </p>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
        >
          Previous
        </button>

        {Array.from({ length: totalPage }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 hover:bg-indigo-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPage}
          className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
