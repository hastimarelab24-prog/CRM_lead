
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setError("");

        // First argument is the HTTP method
        const data = await apiRequest("/audit-logs",{
          method:"GET",
        });
        setLogs(data.logs || [])
        // setLogs(
        //   Array.isArray(data)
        //     ? data
        //     : Array.isArray(data?.logs)
        //       ? data.logs
        //       : []
        // );
      } catch (err) {
        console.error(
          "Failed to load audit logs:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load audit logs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Audit Logs
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review user actions and changes recorded in your CRM.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total audit records
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {logs.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-7 8h6m-6 4h6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Activity History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Recorded actions, entities, and timestamps.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-gray-600">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span>Loading audit logs...</span>
            </div>
          ) : error ? (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-800">
                Unable to load audit logs
              </p>
              <p className="mt-1 break-words text-sm text-red-700">
                {error}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "User",
                      "Action",
                      "Entity",
                      "Record ID",
                      "Date",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {logs.map((log) => (
                    <tr
                      key={log._id || log.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {log.user?.name ||
                            log.user?.email ||
                            "Unknown"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {log.action || "-"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {log.entity || "-"}
                      </td>

                      <td className="max-w-xs break-all px-6 py-4 font-mono text-xs text-gray-500">
                        {log.entityId || "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}

                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-14 text-center"
                      >
                        <p className="font-medium text-gray-700">
                          No audit logs found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Recorded activities will appear here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
