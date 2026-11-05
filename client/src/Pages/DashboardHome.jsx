// import React, { useCallback, useEffect, useState } from "react";

// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Legend,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// import { reportService } from "../services/reportService";

// const COLORS = [
//   "#2563eb",
//   "#16a34a",
//   "#f59e0b",
//   "#8b5cf6",
//   "#ec4899",
//   "#0891b2",
//   "#64748b",
// ];

// const today = new Date().toISOString().slice(0, 10);

// // --------------------------------------------------
// // METRIC CARD
// // --------------------------------------------------
// function MetricCard({ label, value, helper, accent = "blue" }) {
//   const accents = {
//     blue: "border-blue-500",
//     green: "border-emerald-500",
//     red: "border-rose-500",
//     violet: "border-violet-500",
//   };

//   return (
//     <div
//       className={`rounded-2xl border border-slate-200 border-l-4 ${
//         accents[accent]
//       } bg-white p-5 shadow-sm`}
//     >
//       <p className="text-sm font-medium text-slate-500">{label}</p>

//       <p className="mt-2 text-3xl font-bold text-slate-900">
//         {Number(value || 0).toLocaleString()}
//       </p>

//       <p className="mt-1 text-xs text-slate-400">{helper}</p>
//     </div>
//   );
// }

// // --------------------------------------------------
// // EMPLOYEE ACTIVITY TABLE
// // --------------------------------------------------
// function EmployeeActivityTable({ employees = [] }) {
//   return (
//     <section className="overflow-hidden rounded-2xl border border-slate-200
//      bg-white shadow-sm">
//       <div className="border-b border-slate-100 p-5">
//         <h3 className="font-semibold text-slate-900">
//           Employee Activity Summary
//         </h3>

//         <p className="mt-1 text-xs text-slate-500">
//           Assigned leads and follow-up activity for the selected period.
//         </p>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-left text-sm">
//           <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//             <tr>
//               {[
//                 "Employee",
//                 "Role",
//                 "Assigned Leads",
//                 "Won Leads",
//                 "Total Follow-ups",
//                 "Completed",
//                 "Pending",
//                 "Overdue",
//               ].map((heading) => (
//                 <th key={heading} className="whitespace-nowrap px-5 py-3">
//                   {heading}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-100">
//             {employees.map((employee) => (
//               <tr
//                 key={employee._id || employee.email}
//                 className="hover:bg-slate-50"
//               >
//                 <td className="whitespace-nowrap px-5 py-4">
//                   <p className="font-semibold text-slate-800">
//                     {employee.name || "Unknown Employee"}
//                   </p>

//                   <p className="text-xs text-slate-400">
//                     {employee.email || "-"}
//                   </p>
//                 </td>

//                 <td className="whitespace-nowrap px-5 py-4 capitalize">
//                   {employee.role || "employee"}
//                 </td>

//                 <td className="px-5 py-4">{employee.assignedLeads || 0}</td>

//                 <td className="px-5 py-4 font-semibold text-emerald-600">
//                   {employee.wonLeads || 0}
//                 </td>

//                 <td className="px-5 py-4">
//                   {employee.totalFollowUps ?? employee.totalActivities ?? 0}
//                 </td>

//                 <td className="px-5 py-4 font-semibold text-emerald-600">
//                   {employee.completedFollowUps || 0}
//                 </td>

//                 <td className="px-5 py-4 font-semibold text-amber-600">
//                   {employee.pendingFollowUps || 0}
//                 </td>

//                 <td className="px-5 py-4 font-semibold text-rose-600">
//                   {employee.overdueFollowUps || 0}
//                 </td>
//               </tr>
//             ))}

//             {employees.length === 0 && (
//               <tr>
//                 <td colSpan="8" className="px-5 py-10 text-center">
//                   <p className="font-medium text-slate-500">
//                     No employee records found.
//                   </p>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Add team members or check your selected date range.
//                   </p>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </section>
//   );
// }

// // --------------------------------------------------
// // DASHBOARD HOME
// // --------------------------------------------------
// export default function DashboardHome() {
//   const [data, setData] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState(today);

//   // --------------------------------------------------
//   // LOAD DASHBOARD DATA
//   // --------------------------------------------------
//   const load = useCallback(async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const result = await reportService.getDashboard({
//         startDate,
//         endDate,
//       });

//       if (!result?.success) {
//         throw new Error(result?.message || "Could not load dashboard.");
//       }

//       setData(result.data || {});
//     } catch (err) {
//       console.error("Dashboard loading error:", err);

//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "Could not load dashboard.",
//       );

//       setData(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [startDate, endDate]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const summary = data?.summary || {};

//   const hasLeadData = Number(summary.totalLeads || 0) > 0;

//   const employeeActivities = data?.employeeActivities || [];

//   // --------------------------------------------------
//   // RESET FILTER
//   // --------------------------------------------------
//   const handleReset = () => {
//     setStartDate("");
//     setEndDate("");
//   };

//   // --------------------------------------------------
//   // UI
//   // --------------------------------------------------
//   return (
//     <div className="space-y-6">
//       {/* HEADER AND DATE FILTER */}
//       <div className="flex flex-col gap-4 lg:flex-row lg:items-end 
//       lg:justify-between">
//         <div>
//           <p className="text-sm font-semibold uppercase tracking-wider
//            text-blue-600">
//             Overview
//           </p>

//           <h2 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h2>

//           <p className="mt-1 text-sm text-slate-500">
//             Live reporting from your LeadSphere database.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-end gap-3 rounded-xl border
//          border-slate-200 bg-white p-3">
//           <label className="text-xs font-medium text-slate-600">
//             From
//             <input
//               type="date"
//               value={startDate}
//               max={endDate || today}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="mt-1 block rounded-lg border border-slate-300 px-3 
//               py-2 text-sm"
//             />
//           </label>

//           <label className="text-xs font-medium text-slate-600">
//             To
//             <input
//               type="date"
//               value={endDate}
//               min={startDate || undefined}
//               max={today}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="mt-1 block rounded-lg border border-slate-300 px-3 
//               py-2 text-sm"
//             />
//           </label>

//           <button
//             type="button"
//             onClick={load}
//             disabled={loading}
//             className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold
//              text-white hover:bg-blue-700 disabled:cursor-not-allowed 
//              disabled:opacity-60"
//           >
//             {loading ? "Loading..." : "Apply"}
//           </button>

//           <button
//             type="button"
//             onClick={handleReset}
//             className="rounded-lg border border-slate-300 px-4 py-2 text-sm
//              font-semibold text-slate-700 hover:bg-slate-50"
//           >
//             Reset
//           </button>
//         </div>
//       </div>

//       {/* LOADING */}
//       {loading && (
//         <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//           {[1, 2, 3, 4].map((number) => (
//             <div
//               key={number}
//               className="h-28 animate-pulse rounded-2xl bg-slate-200"
//             />
//           ))}
//         </div>
//       )}

//       {/* ERROR */}
//       {!loading && error && (
//         <div
//           role="alert"
//           className="rounded-xl border border-rose-200 bg-rose-50 p-5
//            text-rose-700"
//         >
//           <p className="font-semibold">Dashboard could not be loaded</p>

//           <p className="mt-1 text-sm">{error}</p>

//           <button
//             type="button"
//             onClick={load}
//             className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm 
//             font-semibold text-white"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {/* DASHBOARD CONTENT */}
//       {!loading && !error && (
//         <>
//           {/* LEAD ANALYTICS */}
//           {hasLeadData ? (
//             <>
//               {/* SUMMARY CARDS */}
//               <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//                 <MetricCard
//                   label="Total Leads"
//                   value={summary.totalLeads}
//                   helper="Leads in selected period"
//                 />

//                 <MetricCard
//                   label="Active Leads"
//                   value={summary.activeLeads}
//                   helper="Not won or lost"
//                   accent="violet"
//                 />

//                 <MetricCard
//                   label="Won Leads"
//                   value={summary.wonLeads}
//                   helper="Successfully converted"
//                   accent="green"
//                 />

//                 <MetricCard
//                   label="Conversion Rate"
//                   value={`${summary.conversionRate || 0}%`}
//                   helper="Won leads / total leads"
//                   accent="red"
//                 />
//               </div>

//               {/* CHARTS */}
//               <div className="grid gap-6 xl:grid-cols-2">
//                 {/* LEADS BY STATUS */}
//                 <section className="rounded-2xl border border-slate-200
//                  bg-white p-5 shadow-sm">
//                   <h3 className="font-semibold text-slate-900">
//                     Leads by Status
//                   </h3>

//                   <div className="mt-4 h-72">
//                     {data?.leadsByStatus?.length ? (
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={data.leadsByStatus}>
//                           <CartesianGrid
//                             strokeDasharray="3 3"
//                             vertical={false}
//                           />

//                           <XAxis
//                             dataKey="status"
//                             tick={{ fontSize: 11 }}
//                             interval={0}
//                             angle={-15}
//                             textAnchor="end"
//                             height={55}
//                           />

//                           <YAxis allowDecimals={false} />

//                           <Tooltip />

//                           <Bar
//                             dataKey="count"
//                             fill="#2563eb"
//                             radius={[6, 6, 0, 0]}
//                           />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <p className="pt-20 text-center text-sm
//                        text-slate-400">
//                         No status data available.
//                       </p>
//                     )}
//                   </div>
//                 </section>

//                 {/* LEAD SOURCES */}
//                 <section className="rounded-2xl border border-slate-200
//                  bg-white p-5 shadow-sm">
//                   <h3 className="font-semibold text-slate-900">Lead Sources</h3>

//                   <div className="mt-4 h-72">
//                     {data?.leadSources?.length ? (
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={data.leadSources}
//                             dataKey="count"
//                             nameKey="source"
//                             cx="50%"
//                             cy="50%"
//                             outerRadius={95}
//                             label
//                           >
//                             {data.leadSources.map((entry, index) => (
//                               <Cell
//                                 key={`${entry.source}-${index}`}
//                                 fill={COLORS[index % COLORS.length]}
//                               />
//                             ))}
//                           </Pie>

//                           <Tooltip />
//                           <Legend />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <p className="pt-20 text-center text-sm text-slate-400">
//                         No source data available.
//                       </p>
//                     )}
//                   </div>
//                 </section>
//               </div>
//             </>
//           ) : (
//             <div className="rounded-2xl border border-dashed border-slate-300
//              bg-white p-8 text-center">
//               <div className="text-4xl">📊</div>

//               <h3 className="mt-3 font-semibold text-slate-800">
//                 No leads found
//               </h3>

//               <p className="mt-1 text-sm text-slate-500">
//                 No leads found in the selected date range. Employee activity is
//                 displayed separately below.
//               </p>
//             </div>
//           )}

//           {/* IMPORTANT:
//               Employee Activity Summary is outside hasLeadData.
//               So it will show even when there are zero leads.
//           */}
//           <EmployeeActivityTable employees={employeeActivities} />
//         </>
//       )}
//     </div>
//   );
// }


import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { reportService } from "../services/reportService";
import { WorkspaceContext } from "../context/WorkCountContext";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#0891b2",
  "#64748b",
];

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function MetricCard({
  label,
  value,
  helper,
  accent = "blue",
}) {
  const accents = {
    blue: "border-blue-500",
    green: "border-emerald-500",
    red: "border-rose-500",
    violet: "border-violet-500",
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 border-l-4 ${
        accents[accent] || accents.blue
      } bg-white p-5 shadow-sm`}
    >
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {typeof value === "number"
          ? value.toLocaleString()
          : value ?? 0}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {helper}
      </p>
    </div>
  );
}

function EmployeeActivityTable({ employees = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h3 className="font-semibold text-slate-900">
          Employee Activity Summary
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Assigned leads and follow-up activity for the selected period.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {[
                "Employee",
                "Role",
                "Assigned Leads",
                "Won Leads",
                "Total Follow-ups",
                "Completed",
                "Pending",
                "Overdue",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-5 py-3"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {employees.length > 0 ? (
              employees.map((employee, index) => (
                <tr
                  key={
                    employee.employeeId ||
                    employee._id ||
                    employee.email ||
                    index
                  }
                  className="hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {employee.name || "Unknown Employee"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {employee.email || "-"}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 capitalize">
                    {employee.role || "employee"}
                  </td>

                  <td className="px-5 py-4">
                    {employee.assignedLeads ?? employee.totalLeads ?? 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-emerald-600">
                    {employee.wonLeads ?? 0}
                  </td>

                  <td className="px-5 py-4">
                    {employee.totalFollowUps ??
                      employee.totalActivities ??
                      0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-emerald-600">
                    {employee.completedFollowUps ?? 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-amber-600">
                    {employee.pendingFollowUps ?? 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-rose-600">
                    {employee.overdueFollowUps ?? 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-5 py-10 text-center">
                  <p className="font-medium text-slate-500">
                    No employee records found.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add team members or check your selected date range.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DashboardHome() {
  const { setTotalLeads } = useContext(WorkspaceContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getToday());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await reportService.getDashboard({
        startDate,
        endDate,
      });

      /*
       * Supports both response formats:
       * Axios: { data: { success: true, data: {...} } }
       * Direct: { success: true, data: {...} }
       */
      const responseData =
        result?.data?.success !== undefined
          ? result.data
          : result;

      if (!responseData?.success) {
        throw new Error(
          responseData?.message || "Could not load dashboard."
        );
      }

      const dashboard = responseData.data || {};

      const formattedData = {
        ...dashboard,

        summary: {
          totalLeads: Number(dashboard.totalLeads || 0),
          activeLeads: Number(dashboard.activeLeads || 0),
          wonLeads: Number(dashboard.wonLeads || 0),
          lostLeads: Number(dashboard.lostLeads || 0),
          conversionRate: Number(dashboard.conversionRate || 0),
          totalRevenue: Number(dashboard.totalRevenue || 0),
        },

        leadsByStatus: Array.isArray(dashboard.leadsByStatus)
          ? dashboard.leadsByStatus
          : [],

        leadSources: Array.isArray(dashboard.leadSources)
          ? dashboard.leadSources
          : [],

        employeeActivities: (
          Array.isArray(dashboard.employeeActivitySummary)
            ? dashboard.employeeActivitySummary
            : []
        ).map((employee) => ({
          ...employee,
          assignedLeads:
            employee.totalLeads ?? employee.assignedLeads ?? 0,
        })),
      };

      setData(formattedData);

      if (typeof setTotalLeads === "function") {
        setTotalLeads(formattedData.summary.totalLeads);
      }

      console.log("Dashboard API response:", responseData);
      console.log("Formatted dashboard data:", formattedData);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load dashboard."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, setTotalLeads]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};

  const hasLeadData = Number(summary.totalLeads || 0) > 0;

  const employeeActivities = data?.employeeActivities || [];

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Overview
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Live reporting from your LeadSphere database.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <label className="text-xs font-medium text-slate-600">
            From

            <input
              type="date"
              value={startDate}
              max={endDate || getToday()}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-medium text-slate-600">
            To

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              max={getToday()}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Apply"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((number) => (
            <div
              key={number}
              className="h-28 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700"
        >
          <p className="font-semibold">
            Dashboard could not be loaded
          </p>

          <p className="mt-1 text-sm">{error}</p>

          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {hasLeadData ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Total Leads"
                  value={summary.totalLeads}
                  helper="Leads in selected period"
                />

                <MetricCard
                  label="Active Leads"
                  value={summary.activeLeads}
                  helper="Not won or lost"
                  accent="violet"
                />

                <MetricCard
                  label="Won Leads"
                  value={summary.wonLeads}
                  helper="Successfully converted"
                  accent="green"
                />

                <MetricCard
                  label="Conversion Rate"
                  value={`${summary.conversionRate}%`}
                  helper="Won leads / total leads"
                  accent="red"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900">
                    Leads by Status
                  </h3>

                  <div className="mt-4 h-72">
                    {data.leadsByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.leadsByStatus}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="status"
                            tick={{ fontSize: 11 }}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                            height={55}
                          />

                          <YAxis allowDecimals={false} />

                          <Tooltip />

                          <Bar
                            dataKey="count"
                            fill="#2563eb"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="pt-20 text-center text-sm text-slate-400">
                        No status data available.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900">
                    Lead Sources
                  </h3>

                  <div className="mt-4 h-72">
                    {data.leadSources.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.leadSources}
                            dataKey="count"
                            nameKey="source"
                            cx="50%"
                            cy="50%"
                            outerRadius={95}
                            label
                          >
                            {data.leadSources.map((entry, index) => (
                              <Cell
                                key={`${entry.source}-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>

                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="pt-20 text-center text-sm text-slate-400">
                        No source data available.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="text-4xl">📊</div>

              <h3 className="mt-3 font-semibold text-slate-800">
                No leads found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No leads found in the selected date range. Employee activity is displayed separately below.
              </p>
            </div>
          )}

          <EmployeeActivityTable employees={employeeActivities} />
        </>
      )}
    </div>
  );
}