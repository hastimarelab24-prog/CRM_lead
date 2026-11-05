
import { useState } from "react";
import { apiRequest } from "../api/api";

const CreateUser = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await apiRequest("/users", "POST", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      if (result?.success === false) {
        throw new Error(
          result.message || "Failed to create team member."
        );
      }

      setForm({
        name: "",
        email: "",
        password: "",
        role: "employee",
      });

      if (onSuccess) {
        await onSuccess(result);
      }

    } catch (err) {
      console.error(
        "Create user failed:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Add Team Member
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Create a new team record and assign system roles.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>

        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Name
            </label>

            <input
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none"
              name="name"
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Email
            </label>

            <input
              type="email"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none"
              name="email"
              value={form.email}
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Temporary Password
            </label>

            <input
              type="password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none"
              name="password"
              minLength={8}
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Role
            </label>

            <select
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-lg"
            >
              {loading ? "Creating..." : "Create User"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateUser;
