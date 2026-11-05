
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiRequest } from "../api/api";
import CreateUser from "./CreateUser";
import { WorkspaceContext } from "../context/WorkCountContext";

export default function Team() {
  const [users, setUsers] = useState([]);
  const { setTotalTeam } = useContext(WorkspaceContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3500);
  };

  const loadUsers = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const data = await apiRequest("/users", "GET");

      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data?.users)
        ? data.data.users
        : Array.isArray(data?.data)
        ? data.data
        : [];

      console.log("Users API Response:", data);
      console.log("Loaded Team Members:", userList);

      setUsers(userList);
      setTotalTeam(userList.length);
    } catch (err) {
      console.error(
        "Failed to load users:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load team members."
      );
    } finally {
      setLoading(false);
    }
  }, [setTotalTeam]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUserCreated = async (result) => {
    try {
      await loadUsers();

      setIsModalOpen(false);

      showToast(
        result?.message ||
          result?.data?.message ||
          "Team member created successfully!",
        "success"
      );
    } catch (err) {
      showToast("Team member created, but list refresh failed.", "error");
    }
  };

  const handleRemoveUser = async (userId, userName) => {
    if (!userId) {
      showToast("User ID not found.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${userName} from the team?`
    );

    if (!confirmed) return;

    try {
      const result = await apiRequest(
        `/users/${userId}`,
        "DELETE"
      );

      const updatedUsers = users.filter(
        (user) =>
          String(user._id || user.id) !== String(userId)
      );

      setUsers(updatedUsers);
      setTotalTeam(updatedUsers.length);

      showToast(
        result?.message || "Team member removed successfully!",
        "success"
      );
    } catch (err) {
      console.error(
        "Failed to remove user:",
        err.response?.data || err
      );

      showToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to remove team member.",
        "error"
      );
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();

    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const totalMembers = users.length;

  const managersCount = users.filter((user) => {
    const role = user.role?.toLowerCase();

    return role === "manager" ||
      role === "administrator" ||
      role === "admin";
  }).length;

  const totalLeadsAssigned = users.reduce(
    (total, user) =>
      total +
      Number(
        user.assignedLeadsCount ??
          user.leadsCount ??
          0
      ),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Workspace / Team Members
              </p>

              <h1 className="text-3xl font-bold text-slate-900 mt-2">
                Team Members
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage people, responsibilities, and team capacity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              <span className="text-xl">+</span>
              Add Team Member
            </button>

          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">
                Total Members
              </p>

              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {totalMembers}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">
                Managers / Admins
              </p>

              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {managersCount}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">
                Assigned Leads
              </p>

              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {totalLeadsAssigned}
              </p>
            </div>

          </div>
        </header>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

          <div className="w-full">
            <h3 className="font-bold text-slate-800">
              Everyone on your team
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Manage all registered users and their current system roles.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none"
          />

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-xl border shadow-sm">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />

              <span className="text-sm font-semibold text-slate-600">
                Loading team members...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}

            <button
              type="button"
              onClick={loadUsers}
              className="ml-3 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Team Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredUsers.map((user) => {
              const userId = user._id || user.id;
              const userName = user.name || "Unnamed User";
              const userEmail = user.email || "-";
              const userRole = user.role || "employee";
              const isActive = user.isActive !== false;

              const leadsCount =
                user.assignedLeadsCount ??
                user.leadsCount ??
                0;

              return (
                <div
                  key={userId}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
                >

                  {/* User Details */}
                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
                        {getInitials(userName)}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">
                          {userName}
                        </h4>

                        <p className="text-xs text-slate-500 mt-1 break-all">
                          {userEmail}
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveUser(userId, userName)
                      }
                      title="Remove team member"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <svg
                        className="w-5 h-5"
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

                  {/* Role and Leads */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">

                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {userRole.replace(/\b\w/g, (c) =>
                        c.toUpperCase()
                      )}
                    </span>

                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                      {leadsCount} Leads
                    </span>

                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500">

                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isActive
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />

                    {isActive ? "Active" : "Inactive"}

                  </div>

                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">

                <div className="text-4xl mb-3">👥</div>

                <p className="text-slate-700 font-semibold">
                  No team members found
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Try adjusting your search or add a new team member.
                </p>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[100]">
          <div
            className={`flex items-center gap-3 px-5 py-4 text-white rounded-xl shadow-xl ${
              toast.type === "success"
                ? "bg-emerald-600"
                : "bg-rose-600"
            }`}
          >
            <span className="text-lg">
              {toast.type === "success" ? "✓" : "!"}
            </span>

            <p className="text-sm font-semibold">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() =>
                setToast({
                  show: false,
                  message: "",
                  type: "success",
                })
              }
              className="ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUser
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUserCreated}
      />

    </div>
  );
}
