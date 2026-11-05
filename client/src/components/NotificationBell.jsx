
import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/api";

const NotificationBell = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const shownPopupIds = useRef(new Set());

  const load = useCallback(async () => {
    try {
      const data = await apiRequest("/notifications");
      const nextItems = data.notifications || [];

      setItems(nextItems);
      setUnread(data.unreadCount || 0);
      setError("");

      // Display a browser popup once per notification while this page is open.
      if ("Notification" in window && Notification.permission === "granted") {
        nextItems
          .filter((item) => !item.isRead)
          .forEach((item) => {
            if (!shownPopupIds.current.has(item._id)) {
              shownPopupIds.current.add(item._id);
              new Notification(item.title, { body: item.message });
            }
          });
      }
    } catch (err) {
      console.error("Notification load failed:", err);
      setError(
        err.response?.data?.message || "Unable to load notifications."
      );
    }
  }, []);

  useEffect(() => {
    load();

    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const enableBrowserAlerts = async () => {
    if (!("Notification" in window)) {
      setError("This browser does not support notifications.");
      return;
    }

    const permission = await window.Notification.requestPermission();

    if (permission === "granted") {
      new window.Notification("LeadSphere CRM", {
        body: "Browser notifications are enabled.",
      });
      setError("");
      await load();
    } else {
      setError("Allow notifications in your browser settings.");
    }
  };

  const markRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, {
        method: "PATCH",
      });
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to mark notification as read."
      );
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update notifications."
      );
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="relative rounded-lg border bg-white p-3 shadow-sm"
          aria-label={`Notifications, ${unread} unread`}
        >
          🔔
          {unread > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={enableBrowserAlerts}
          className="rounded-lg bg-blue-700 px-3 py-2 text-sm text-white"
        >
          Enable browser alerts
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 max-w-[90vw] rounded-xl border bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold">Notifications</h2>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-sm text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications yet.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-lg border p-3 ${
                    item.type === "overdue"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead(item._id)}
                      className="mt-2 text-sm font-semibold text-blue-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
