
import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const LeadActivityHistory = ({ leadId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leadId) return;

    let active = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(
          `/follow-ups/lead/${leadId}/history`
        );

        if (active) setHistory(data.history || []);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load activity history."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [leadId]);

  if (loading) return <p>Loading activity history...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section className="mt-6 rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-bold">Lead Activity History</h2>

      {history.length === 0 ? (
        <p className="text-sm text-slate-500">
          No activity history available yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {history.map((item, index) => (
            <li
              key={`${item.followUpId}-${item.action}-${item.createdAt}-${index}`}
              className="border-l-2 border-blue-200 pl-4"
            >
              <p className="font-semibold">
                {item.action} — {item.followUpTitle}
              </p>
              <p className="text-sm text-slate-600">{item.details}</p>
              <p className="mt-1 text-xs text-slate-500">
                By: {item.performedBy?.name || item.performedBy?.email || "User"}
                {" · "}
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default LeadActivityHistory;
