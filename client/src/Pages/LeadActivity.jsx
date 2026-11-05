import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/api";

export default function LeadActivity() {
  const { leadId } = useParams();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(
          `/follow-ups/lead/${leadId}/history`
        );

        if (active) {
          setActivities(data.history || []);
        }
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
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [leadId]);

  if (loading) {
    return <p className="p-6">Loading activity history...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="p-6 text-red-600">
        {error}
      </p>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <h1 className="mb-2 text-2xl font-bold">
        Lead Activity History
      </h1>

      <p className="mb-6 text-sm text-slate-500">
        Complete timeline of follow-up activities for this lead.
      </p>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">
          No activity history available.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <article
              key={activity._id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {activity.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {activity.type} · {activity.status}
                  </p>
                </div>

                <span className="text-sm text-slate-500">
                  {new Date(
                    activity.updatedAt
                  ).toLocaleString()}
                </span>
              </div>

              <p className="mt-3 text-sm">
                <strong>Assigned to:</strong>{" "}
                {activity.assignedTo?.name || "Unknown"}
              </p>

              {activity.activityHistory?.length > 0 && (
                <ul className="mt-4 space-y-3 border-l-2 border-blue-200 pl-4">
                  {activity.activityHistory.map(
                    (entry, index) => (
                      <li key={`${activity._id}-${index}`}>
                        <p className="font-medium">
                          {entry.action}
                        </p>

                        <p className="text-sm text-slate-600">
                          {entry.details}
                        </p>

                        <p className="text-xs text-slate-400">
                          {entry.performedBy?.name || "User"}
                          {" · "}
                          {new Date(
                            entry.createdAt
                          ).toLocaleString()}
                        </p>
                      </li>
                    )
                  )}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}