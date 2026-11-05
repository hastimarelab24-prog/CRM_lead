import React from "react";

const STATUS_STYLES = {
  new: "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500",
  contacted:
    "bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500",
  Qualified:
    "bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-500",
  "Proposal Sent":
    "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500",
  Nurturing: "bg-sky-50 text-sky-700 border-sky-200 focus:ring-sky-500",
  Lost: "bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500",
  Won: "bg-emrald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500",
};

export default function LeadTable({
  leads = [],
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}) {
  const getInitials = (name) => {
    if (!name || name === "-") return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              <th className="py-3.5 px-6">Name</th>
              <th className="py-3.5 px-6">Company</th>
              <th className="py-3.5 px-6">Phone</th>
              <th className="py-3.5 px-6">Email</th>
              <th className="py-3.5 px-6">Assigned To</th>
              <th className="py-3.5 px-6">Source</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-slate-100 rounded-full text-slate-400 ">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p>No active leads found in the system registry.</p>
                </td>
              </tr>
            ) : (
              leads.map((lead, index) => {
                const leadName =lead.name ||lead.Name ||lead.leadName ||lead.clientName ||"-";
                const leadCompany = lead.company || lead.Company || lead.companyName || "-";
                  const leadPhone = lead.phone || lead.Phone || "-";
                const leadEmail =   lead.email || lead.Email || lead.clientEmail || "-";
                const currentStatus = lead.status || "New";
                const assignedName =  typeof lead.assignedEmployee === "object"  && lead.assignedEmployee !== null ? (lead.assignedEmployee?.name || lead.assignedEmployee.username || lead.assignedEmployee.email ):(lead.assignedEmpoloyee || lead.assignedTo || "Unassigned")
                                return (
                  <tr
                    key={lead._id || index}
                    className="hover:bg-gray-50/70 transition-colors duration-150 group"
                  >
                    {/* name  */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs shrink-0">
                          {getInitials(leadName)}
                        </div>

                        <span className=" font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {leadName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-slte-600 font-medium">
                      {leadCompany}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs">
                      {leadPhone}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs">
                      {leadEmail}
                    </td>
                    <td className="py-3.5 px-6 text-slate700 text-xs">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md">
                        {assignedName}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 border border-slate-200/60">
                        {lead.source || "Website"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          onStatusChange(lead._id, e.target.value)
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border outline-none transition-all duration-200 cursor-pointer focus:ring-offset-1${
                          STATUS_STYLES[currentStatus] ||
                          "bg-slate-50 text-slate-700  border-slate-200 focus:ring-slate-400"
                        }`}
                      >
                        {[
                          "New",
                          "Contacted",
                          "Qualified",
                          "Proposal Sent",
                          "Nurturing",
                          "Lost",
                          "Won",
                        ].map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-white text-slate font-normal"
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* active */}
                    <td className="py-3.5 px-6 text-right ">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(lead)}
                            title="view details"
                            aria-label="view detais"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(lead)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(lead._id)}
                          className="p-=1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
