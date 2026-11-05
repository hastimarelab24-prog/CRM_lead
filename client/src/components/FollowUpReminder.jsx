
import React, { useEffect, useState } from "react";

const FollowUpReminder = ({ followUps = [] }) => {
  const [dismissed, setDismissed] = useState([]);

  const now = Date.now();
  const soonLimit = now + 30 * 60 * 1000;

  const reminders = followUps.filter((item) => {
    if (item.status !== "pending" || !item.dueDate) return false;

    const dueTime = new Date(item.dueDate).getTime();
    return !Number.isNaN(dueTime) && dueTime <= soonLimit;
  });

  useEffect(() => {
    setDismissed((previous) =>
      previous.filter((id) =>
        reminders.some((item) => item._id === id)
      )
    );
  }, [followUps]);

  const visibleReminders = reminders.filter(
    (item) => !dismissed.includes(item._id)
  );

  if (visibleReminders.length === 0) return null;

  return (
    <div className="mb-6 space-y-3" aria-live="assertive">
      {visibleReminders.map((item) => {
        const overdue = new Date(item.dueDate).getTime() < now;

        return (
          <div
            key={item._id}
            role="alert"
            className={`flex items-start gap-3 rounded-xl border-l-4 p-4 shadow-md ${
              overdue
                ? "border-red-600 bg-red-50 text-red-900"
                : "border-amber-500 bg-amber-50 text-amber-900"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {overdue ? "🚨" : "🔔"}
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold">
                {overdue
                  ? " OVERDUE FOLLOW-UP!"
                  : " FOLLOW-UP REMINDER"}
              </h3>

              <p className="mt-1 font-semibold">{item.title}</p>

              <p className="mt-1 text-sm">
                {overdue
                  ? "This follow-up is overdue. Please take action now."
                  : "Your follow-up is due within the next 30 minutes."}
              </p>

              <p className="mt-1 text-sm">
                Due: {new Date(item.dueDate).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDismissed((previous) => [...previous, item._id])
              }
              className="rounded px-2 py-1 font-bold hover:bg-white/70"
              aria-label="Dismiss reminder"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FollowUpReminder;
