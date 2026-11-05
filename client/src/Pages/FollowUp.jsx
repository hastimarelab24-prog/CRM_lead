import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
  faCalendarAlt,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import { IoRemoveCircle } from "react-icons/io5";
import axios from 'axios';
import { apiRequest } from "../api/api";

export default function FollowUp() {
  const [followUps, setFollowUps] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("GET", "/follow-ups");
      console.log("API Response:", response);

      // બેકએન્ડના રિસ્પોન્સ ગમે તે ફોર્મેટમાં હોય તેને હેન્ડલ કરવા માટે:
      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response && Array.isArray(response.followUps)) {
        list = response.followUps;
      } else if (response && Array.isArray(response.data)) {
        list = response.data;
      } else if (response && response.data && Array.isArray(response.data.followUps)) {
        list = response.data.followUps;
      }

      setFollowUps(list);
    } catch (err) {
      console.error("Error fetching follow-ups:", err);
      setError(err.response?.data?.message || err.message || "Failed to load follow-ups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const getStatus = (item) =>
    String(item?.status || "pending").toLowerCase();

  const pending = followUps.filter(
    (item) => getStatus(item) === "pending"
  );

  const completed = followUps.filter(
    (item) => getStatus(item) === "completed"
  );

  const cancelled = followUps.filter(
    (item) => getStatus(item) === "cancelled"
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = pending.filter((item) => {
    if (!item.dueDate) return false;

    const due = new Date(item.dueDate);

    if (Number.isNaN(due.getTime())) return false;

    due.setHours(0, 0, 0, 0);

    return due < today;
  });

  const getDisplayedData = () => {
    switch (activeTab) {
      case "pending":
        return pending;

      case "completed":
        return completed;

      case "overdue":
        return overdue;

      case "cancelled":
        return cancelled;

      default:
        return followUps;
    }
  };

  const markAsCompleted = async (id) => {
    try {
      await apiRequest(
        "PATCH",
        `/follow-ups/${id}/complete`,
        {}
      );

      await fetchFollowUps();
    } catch (error) {
      console.error(
        "Complete Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to complete follow-up."
      );
    }
  };
const deleteFollowUp = async (id) => {
    const confirmed = window.confirm("Are you sure you want to cancel this follow-up?");
    if (!confirmed) return;

    try {
      // જો તમારો રાઉટ /api/follow-ups/:id હોય તો આ બરાબર છે:
      await apiRequest("DELETE", `/follow-ups/${id}`);

      await fetchFollowUps(); // ડેટા રિફ્રેશ કરવા માટે
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to cancel follow-up.");
    }
  };

  

  const getPriorityClass = (priority) => {
    switch (
      String(priority || "medium").toLowerCase()
    ) {
      case "urgent":
      case "high":
        return "bg-red-100 text-red-700";

      case "low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-IN");
  };

  const displayedData = getDisplayedData();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Follow-ups Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage all lead follow-up activities.
          </p>
        </div>

        <button
          onClick={fetchFollowUps}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRefresh}
            className="mr-2"
          />

          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {overdue.length > 0 && (
        <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="mr-2"
            />

            Overdue Follow-ups
          </p>

          <p className="mt-1 text-sm text-red-600">
            You have {overdue.length} overdue follow-up tasks.
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            All Follow-ups
          </p>

          <h3 className="text-2xl font-bold text-gray-800">
            {followUps.length}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <h3 className="text-2xl font-bold text-blue-600">
            {pending.length}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <h3 className="text-2xl font-bold text-green-600">
            {completed.length}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Overdue
          </p>

          <h3 className="text-2xl font-bold text-red-600">
            {overdue.length}
          </h3>
        </div>

      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto border-b pb-2">

        {[
          ["all", `All (${followUps.length})`],
          ["pending", `Pending (${pending.length})`],
          ["completed", `Completed (${completed.length})`],
          ["overdue", `Overdue (${overdue.length})`],
          ["cancelled", `Cancelled (${cancelled.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${
              activeTab === key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}

      </div>

      {/* Follow-up Table */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">

        <table className="min-w-[950px] w-full">

          <thead className="bg-gray-100">
            <tr>
              {[
                "Lead Name",
                "Phone",
                "Follow-up Title",
                "Type",
                "Date",
                "Priority",
                "Assigned To",
                "Notes",
                "Status",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {loading ? (
              <tr>
                <td
                  colSpan="10"
                  className="py-10 text-center"
                >
                  Loading follow-ups...
                </td>
              </tr>
            ) : displayedData.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="py-10 text-center text-gray-500"
                >
                  No follow-ups found.
                </td>
              </tr>
            ) : (
              displayedData.map((item) => {
                const status = getStatus(item);

                const lead =
                  item.lead &&
                  typeof item.lead === "object"
                    ? item.lead
                    : {};

                const assignedTo =
                  item.assignedTo &&
                  typeof item.assignedTo === "object"
                    ? item.assignedTo
                    : {};

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {lead.name ||
                        item.leadName ||
                        item.name ||
                        "N/A"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {lead.phone ||
                        item.phone ||
                        "N/A"}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium">
                      {item.title || "Follow-up"}
                    </td>

                    <td className="px-4 py-4 text-sm capitalize">
                      {item.type ||
                        item.activityType ||
                        "Call"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="mr-2 text-gray-400"
                      />

                      {formatDate(item.dueDate)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${getPriorityClass(
                          item.priority
                        )}`}
                      >
                        {item.priority || "Medium"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {assignedTo.name ||
                        assignedTo.email ||
                        "N/A"}
                    </td>

                    <td className="max-w-[180px] px-4 py-4 text-sm">
                      {item.notes || "No notes"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">

                      <div className="flex items-center gap-3">

                        {status === "pending" && (
                          <button
                            onClick={() =>
                              markAsCompleted(item._id)
                            }
                            title="Mark as completed"
                            className="text-green-600 hover:text-green-800"
                          >
                            <FontAwesomeIcon
                              icon={faCheck}
                            />
                          </button>
                        )}

                        {status === "pending" && (
                          <button
                            onClick={() =>
                              deleteFollowUp(item._id)
                            }
                            title="Cancel follow-up"
                            className="text-xl text-red-500 hover:text-red-700"
                          >
                            <IoRemoveCircle />
                          </button>
                        )}

                        {status === "completed" && (
                          <span className="text-green-600">
                            <FontAwesomeIcon
                              icon={faCheck}
                            />
                          </span>
                        )}

                        {status === "cancelled" && (
                          <span className="text-gray-400">
                            Cancelled
                          </span>
                        )}

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