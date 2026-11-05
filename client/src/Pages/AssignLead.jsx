
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const AssignLead = () => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leadId, setLeadId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");

        const [leadData, userData] = await Promise.all([
          apiRequest("get", "/leads"),
          apiRequest("get", "/users"),
        ]);

        const leadList = Array.isArray(leadData)
          ? leadData
          : leadData?.leads || leadData?.data || [];

        const userList = Array.isArray(userData)
          ? userData
          : userData?.users || userData?.data || [];

        setLeads(leadList);

        const activeEmployees = userList.filter(
          (user) =>
            user.role?.toLowerCase() === "employee" &&
            user.isActive !== false
        );

        setEmployees(activeEmployees);
      } catch (err) {
        console.error("Failed to load assignment data:", {
          status: err.response?.status,
          response: err.response?.data,
          message: err.message,
        });

        setError(
          err.response?.data?.message ||
            "Could not load leads or employees."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!leadId || !employeeId) {
      setError("Please select both a lead and an employee.");
      return;
    }

    try {
      setLoading(true);

      const result = await apiRequest(
        "patch",
        `/leads/${leadId}/assign`,
        { employeeId }
      );

      setMessage(result?.message || "Lead assigned successfully.");

      setLeadId("");
      setEmployeeId("");
    } catch (err) {
      console.error("Lead assignment failed:", {
        status: err.response?.status,
        response: err.response?.data,
        message: err.message,
      });

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to assign lead."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Lead Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Assign Lead to Employee
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Select a lead and assign it to an active employee.
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Assignment Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose the lead and the team member responsible for it.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Success Message */}
            {message && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <span className="font-bold">✓</span>
                <p>{message}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1 break-words">{error}</p>
              </div>
            )}

            {loadingData ? (
              <div className="flex items-center justify-center gap-3 py-12 text-slate-600">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <span>Loading leads and employees...</span>
              </div>
            ) : (
              <form onSubmit={handleAssign} className="space-y-6">
                {/* Lead Dropdown */}
                <div>
                  <label
                    htmlFor="leadId"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Select Lead <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="leadId"
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">Choose a lead</option>

                    {leads.map((lead) => (
                      <option
                        key={lead._id || lead.id}
                        value={lead._id || lead.id}
                      >
                        {lead.name ||
                          lead.leadName ||
                          lead.company ||
                          lead.email ||
                          "Unnamed Lead"}
                        {lead.company && lead.name
                          ? ` — ${lead.company}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {leads.length === 0 && (
                    <p className="mt-2 text-sm text-amber-700">
                      No leads found. Create a lead before assigning it.
                    </p>
                  )}
                </div>

                {/* Employee Dropdown */}
                <div>
                  <label
                    htmlFor="employeeId"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Select Employee <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="employeeId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">Choose an employee</option>

                    {employees.map((employee) => (
                      <option
                        key={employee._id || employee.id}
                        value={employee._id || employee.id}
                      >
                        {employee.name || employee.username || "Employee"}
                        {employee.email ? ` (${employee.email})` : ""}
                      </option>
                    ))}
                  </select>

                  {employees.length === 0 && (
                    <p className="mt-2 text-sm text-amber-700">
                      No active employees found. Check the users API,
                      employee roles, and account status.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      leads.length === 0 ||
                      employees.length === 0
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto sm:min-w-44"
                  >
                    {loading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}

                    {loading ? "Assigning..." : "Assign Lead"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignLead;
