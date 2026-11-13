// import React, { useState, useEffect, useCallback, useContext } from "react";
// import { leadService } from "../services/leadService";
// import LeadTable from "../components/leads/LeadTable";
// import LeadModal from "../components/leads/LeadModal";
// import LeadForm from "../components/leads/leadFrom";
// import Pagination from "../components/common/pagination";
// import { WorkspaceContext } from "../context/WorkCountContext";
// import * as XLSX from "xlsx";
// import { replace } from "react-router-dom";

// export default function Leads() {
//   const [leads, setLeads] = useState([]);
//   const { setTotalLeads } = useContext(WorkspaceContext);
//   const [pagination, setPagination] = useState({
//     totalPages: 1,
//     totalItems: 0,
//     currentPage: 1,
//     limit: 10,
//   });

//   const [filters, setFilters] = useState({
//     search: "",
//     status: "",
//     sortBy: "createdAt",
//     sortOrder: "desc",
//     page: 1,
//   });
//   const [modal, setModal] = useState({ isOpen: false, data: null });
//   const [isLoading, setIsLoading] = useState(false);
//   const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

//   const loadLeads = useCallback(async () => {
//     setIsLoading(true);

//     try {
//       const response = await leadService.fetchLeads({
//         ...filters,
//         page: filters.page,
//         limit: 10,
//       });

//       const result = response?.data ?? response;
//       const leadsData = Array.isArray(result?.leads) ? result.leads : [];
//       const apiPagination = result?.pagination || {};

//       const totalItems = Number(
//         apiPagination.totalLeads ?? apiPagination.totalItems ?? 0,
//       );

//       const totalPages = Math.ceil(totalItems / 10);

//       if (totalPages > 0 && filters.page > totalPages) {
//         setFilters((prev) => ({
//           ...prev,
//           page: totalPages,
//         }));
//         return;
//       }

//       setLeads(leadsData);

//       setPagination({
//         currentPage: filters.page,
//         totalPage: totalPages,
//         totalPages: totalPages,
//         totalLeads: totalItems,
//         totalItems: totalItems,
//         limit: 10,
//       });

//       setTotalLeads(totalItems);
//     } catch (err) {
//       console.error("Load leads failed:", err.response?.data || err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [filters, setTotalLeads]);

//   useEffect(() => {
//     loadLeads();
//   }, [loadLeads]);

//   const handleFormSubmit = async (formData) => {
//     try {
//       if (modal.data) {
//         await leadService.updateLead(modal.data._id, formData);
//         setModal({ isOpen: false, data: null });
//         await loadLeads();
//       } else {
//         await leadService.createLead(formData);
//         setModal({ isOpen: false, data: null });
//         setFilters((prev) => ({
//           ...prev,
//           page: 1,
//         }));
//       }
//     } catch (err) {
//       console.error("Submit failed:", err);
//       alert(
//         err.response?.data?.message || "Unable to save lead. Please try again.",
//       );
//     }
//   };

//   const handleStatusChange = async (id, nextStatus) => {
//     try {
//       await leadService.patchStatus(id, nextStatus);
//       loadLeads();
//     } catch (err) {
//       alert(err.message || "State machine rule violation encountered.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Permanently wipe this lead record?")) {
//       return;
//     }

//     try {
//       await leadService.deleteLead(id);
//       await loadLeads();
//     } catch (error) {
//       console.error("Delete error:", error);
//       alert(
//         error.response?.data?.message ||
//         "Lead delete failed. Please try again.",
//       );
//     }
//   };

//   const handleView = (lead) => {
//     setViewModal({ isOpen: true, data: lead });
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage < 1 || newPage > pagination.totalPages) {
//       return;
//     }

//     setFilters((prev) => ({
//       ...prev,
//       page: newPage,
//     }));
//   };

// // Fully Fixed CSV Export Function
//   const handleExportCSV = async () => {
//     try {
//       setIsLoading(true);
//       let allLeads = [];
//       let currentPages = 1;
//       let totalPages = 1;

//       // Loop through all pages to fetch every lead
//       do {
//         const response = await leadService.fetchLeads({
//           ...filters,
//           page: currentPages,
//           limit: 10,
//         });
//         const result = response?.data ?? response;
//         const LeadsData = Array.isArray(result?.leads) ? result.leads : [];
//         const apiPagination = result?.pagination || {};

//         totalPages = apiPagination.totalPages || apiPagination.totalPage || 1;

//         if (LeadsData.length > 0) {
//           allLeads = [...allLeads, ...LeadsData];
//         }
//         currentPages++;
//       } while (currentPages <= totalPages);

//       if (allLeads.length === 0) {
//         alert("No data found to download.");
//         return;
//       }

//       // Headers Correct Formatting
//       const headers = [
//         "Name",
//         "Company",
//         "Email",
//         "Phone",
//         "Assigned To",
//         "Status",
//         "Source",
//         "Priority",
//         "Created At",
//         "Total Follow-ups",
//         "Follow-up Titles",
//         "Follow-Up Dates",
//         "Follow-up Status",
//         "Follow-up Notes",
//       ];

//       const rows = allLeads.map((lead) => {
//         let assignedName = "Unassigned";

//         if (lead.assignedEmployee) {
//           if (typeof lead.assignedEmployee === "object" && lead.assignedEmployee !== null) {
//             assignedName = lead.assignedEmployee.name || lead.assignedEmployee.username || "Unassigned";
//           } else {
//             assignedName = lead.assignedEmployee;
//           }
//         } else if (lead.assignedTo) {
//           assignedName = typeof lead.assignedTo === "object" ? lead.assignedTo.name : lead.assignedTo;
//         }

//         // Safe Follow-ups Extract & Format
//         const followUps = Array.isArray(lead.followUps) ? lead.followUps : [];
//         const totalFollowUps = followUps.length;

//         const fuTitles = followUps.length > 0 
//           ? followUps.map((f) => f.title || "-").join(" | ") 
//           : "N/A";

//         const fuDates = followUps.length > 0 
//           ? followUps.map((f) => (f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "-")).join(" | ") 
//           : "N/A";

//         const fuStatuses = followUps.length > 0 
//           ? followUps.map((f) => f.status || "pending").join(" | ") 
//           : "N/A";

//         const fuNotes = followUps.length > 0 
//           ? followUps.map((f) => (f.notes ? String(f.notes).replace(/[\r\n]+/g, " ") : "-")).join(" | ") 
//           : "N/A";

//         return [
//           `"${lead.name || lead.Name || ""}"`,
//           `"${lead.company || lead.Company || ""}"`,
//           `"${lead.email || lead.Email || ""}"`,
//           `"${lead.phone || lead.Phone || ""}"`,
//           `"${assignedName}"`,
//           `"${lead.status || "New"}"`,
//           `"${lead.source || "Website"}"`,
//           `"${lead.priority || "Medium"}"`,
//           `"${lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""}"`,
//           `"${totalFollowUps}"`,
//           `"${fuTitles}"`,
//           `"${fuDates}"`,
//           `"${fuStatuses}"`,
//           `"${fuNotes}"`,
//         ];
//       });

//       const csvContent = [
//         headers.join(","),
//         ...rows.map((row) => row.join(",")),
//       ].join("\n");

//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.setAttribute("href", url);
//       link.setAttribute(
//         "download",
//         `leads_and_followups_${new Date().toISOString().slice(0, 10)}.csv`
//       );
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (err) {
//       console.error("Export failed:", err);
//       alert("CSV Export mistake now");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleImportExcel = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       setIsLoading(true);
//       const data = await file.arrayBuffer();

//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];

//       const rows = XLSX.utils.sheet_to_json(sheet, {
//         defval: "",
//         raw: true,
//         rawNumbers: false,
//       });

//       if (!rows.length) {
//         alert("Excel file is empty.");
//         return;
//       }

//       const normalize = (value) =>
//         String(value || "")
//           .trim()
//           .toLowerCase()
//           .replace(/[\s_-]+/g, "");
//       const importLeads = rows.map((row) => {
//         const normalizedRow = {};
//         Object.keys(row).forEach((key) => {
//           normalizedRow[normalize(key)] = row[key];
//         });

//         const validStatuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Nurturing", "Lost", "Won"];
//         const validPriorities = ["Low", "Medium", "High"];
//         const validSources = ["Website", "Inbound call", "Social Media", "Referral", "Cold Outreach", "Other"];

//         let rawStatus = normalizedRow.status || "New";
//         let formattedStatus = validStatuses.find((s) => s.toLowerCase() === rawStatus.toLowerCase()) || "New";

//         let rawPriority = normalizedRow.priority || "Medium";
//         let formattedPriority = validPriorities.find((p) => p.toLowerCase() === rawPriority.toLowerCase()) || "Medium";

//         let rawSource = normalizedRow.source || "Website";
//         let formattedSource = validSources.find((src) => src.toLowerCase() === rawSource.toLowerCase()) || "Website";

//         // Phone number Scientific Notation change formmating
//         let phoneVal = normalizedRow.phone || normalizedRow.phonenumber || "";
//         if (typeof phoneVal === "number") {
//           phoneVal = phoneVal.toLocaleString("fullwide", { useGrouping: false });
//         }

//         return {
//           name: normalizedRow.name || normalizedRow.fullname || "",
//           company: normalizedRow.company || "",
//           email: normalizedRow.email || normalizedRow.emailaddress || "",
//           phone: String(phoneVal).trim(),
//           assignedTo: normalizedRow.assignedEmployee || normalizedRow.assignedTo || "",
//           source: formattedSource,
//           status: formattedStatus,
//           priority: formattedPriority,
//         };
//       });

//       // Valid leads check
//       const validLeads = importLeads.filter((lead) => lead.name && lead.email);

//       if (!validLeads.length) {
//         alert("No valid leads found. Name and Email are required.");
//         return;
//       }

//       let successCount = 0;
//       let failedCount = 0;

//       for (const lead of validLeads) {
//         try {
//           await leadService.createLead(lead);
//           successCount++;
//         } catch (err) {
//           failedCount++;
//           console.error("Import failed:", lead.email, err.response?.data || err.message);
//         }
//       }

//       // first page filter set
//       setFilters((prev) => ({
//         ...prev,
//         page: 1,
//       }));

//       alert(`Import completed!\nSuccessful: ${successCount}\nFailed: ${failedCount}`);

//       await loadLeads();

//     } catch (err) {
//       console.error("Excel import error:", err);
//       alert("Unable to import excel file");
//     } finally {
//       setIsLoading(false);
//       event.target.value = "";
//     }
//   };;
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 p-4 selection:bg-indigo-600">
//       <div className="max-w-9xl mx-auto space-y-0">
//         {/* header */}
//         <header className="mb-8 relative overflow-hidden bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
//           <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//             <div className="space-y-2">
//               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
//                 Lead Registry Control
//               </h1>
//               <p className="text-sm text-gray-500 max-w-xl">
//                 Monitor pipeline conversions, channels, and personnel hello
//                 assignments.
//               </p>
//             </div>
//             <div className="flex flex-wrap items-center gap-3">
//               <label className="inline-flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow cursor-pointer">
//                 <span>📥 Import Excel</span>

//                 <input
//                   type="file"
//                   accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
//                   onChange={handleImportExcel}
//                   className="hidden"
//                 />
//               </label>
//               <button
//                 onClick={handleExportCSV}
//                 className="inline-flex items-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-300 cursor-pointer"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                   />
//                 </svg>
//                 <span>Export CSV</span>
//               </button>
//               <button
//                 onClick={() => setModal({ isOpen: true, data: null })}
//                 className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/35 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer"
//               >
//                 <svg
//                   className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2.5}
//                     d="M12 4v16m8-8H4"
//                   />
//                 </svg>
//                 <span>Onboard New Lead</span>
//               </button>
//             </div>
//           </div>

//           {/* metric card */}
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
//             <div className="group p-4 rounded-xl bg-slate-50/70 shadow-none hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
//               <p className="text-xl text-slate-500 font-medium group-hover:text-indigo-700 transition-colors">
//                 Total Registered
//               </p>
//               <p className="text-2xl font-bold text-indigo-600 mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
//                 {pagination?.totalItems || leads.length}
//               </p>
//             </div>
//             <div className="group p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-indigo-200 shadow-none hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 cursor-default">
//               <p className="text-xl text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">
//                 Active Displayed
//               </p>
//               <p className="text-2xl font-bold text-indigo-600 mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
//                 {leads.length}
//               </p>
//             </div>
//           </div>
//         </header>

//         {/* filter bar */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md">
//           <div className="relative md:col-span-6 group">
//             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200">
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="m21 21-4.35-4.35"
//                 />
//               </svg>
//             </div>
//             <input
//               type="text"
//               placeholder="Filter string matching details..."
//               value={filters.search}
//               onChange={(e) =>
//                 setFilters((prev) => ({
//                   ...prev,
//                   search: e.target.value,
//                 }))
//               }
//               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-4 focus:ring-indigo-600/10 hover:bg-white"
//             />
//           </div>
//           <div className="md:col-span-3">
//             <select
//               value={filters.status}
//               onChange={(e) =>
//                 setFilters((prev) => ({
//                   ...prev,
//                   status: e.target.value,
//                   page: 1,
//                 }))
//               }
//               className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 rounded-xl text-sm text-slate-900 outline-none transition-all duration-200 focus:ring-4 focus:ring-indigo-600/10 hover:bg-white cursor-pointer"
//             >
//               <option value="">All Workflow Stages</option>
//               {[
//                 "New",
//                 "Contacted",
//                 "Qualified",
//                 "Proposal Sent",
//                 "Nurturing",
//                 "Lost",
//                 "Won",
//               ].map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="md:col-span-3">
//             <select
//               value={`${filters.sortBy}-${filters.sortOrder}`}
//               onChange={(e) => {
//                 const [sortBy, sortOrder] = e.target.value.split("-");
//                 setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
//               }}
//               className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 rounded-xl text-sm text-slate-900 outline-none transition-all duration-200 focus:ring-4 focus:ring-indigo-600/10 hover:bg-white cursor-pointer"
//             >
//               <option value="createdAt-desc">Date Created (Newest)</option>
//               <option value="createdAt-asc">Date Created (Oldest)</option>
//               <option value="name-asc">Name (A-Z)</option>
//               <option value="name-desc">Name (Z-A)</option>
//             </select>
//           </div>
//         </div>

//         {/* main table container */}
//         <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden mt-4">
//           {isLoading && (
//             <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center transition-all">
//               <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xl animate-bounce">
//                 <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
//                 <span className="text-xs font-semibold text-slate-700">
//                   Fetching Records...
//                 </span>
//               </div>
//             </div>
//           )}

//           <div className="p-1">
//             <LeadTable
//               leads={leads}
//               onEdit={(lead) => setModal({ isOpen: true, data: lead })}
//               onDelete={handleDelete}
//               onStatusChange={handleStatusChange}
//               onView={handleView}
//             />
//           </div>

//           <div className="p-4 border-t border-slate-100 bg-slate-50/50">
//             <Pagination
//               pagination={pagination}
//               onPageChange={handlePageChange}
//             />
//           </div>
//         </div>

//         <LeadModal
//           isOpen={modal.isOpen}
//           onClose={() => setModal({ isOpen: false, data: null })}
//           title={modal.data ? "Update Lead Profile" : "Register Target Lead"}
//         >
//           <LeadForm
//             initialData={modal.data}
//             onSubmit={handleFormSubmit}
//             onClose={() => setModal({ isOpen: false, data: null })}
//           />
//         </LeadModal>

//         {/* view modal */}
//         <LeadModal
//           isOpen={viewModal.isOpen}
//           onClose={() => setViewModal({ isOpen: false, data: null })}
//           title="lead details"
//         >
//           {viewModal.data && (
//             <div className="space-y-4 text-sm">
//               <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200">
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase">
//                     Full Name
//                   </p>
//                   <p className="font-bold text-slate-900 mt-0.5">
//                     {viewModal.data.name || viewModal.data.Name || "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase">
//                     Company
//                   </p>
//                   <p className="font-bold text-slate-900 mt-0.5">
//                     {viewModal.data.company || viewModal.data.Company || "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase">
//                     Email Address
//                   </p>
//                   <p className="font-bold text-slate-900 mt-0.5">
//                     {viewModal.data.email || viewModal.data.Email || "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase">
//                     Workflow Status
//                   </p>
//                   <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
//                     {viewModal.data.status || "New"}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase">
//                     Source
//                   </p>
//                   <p className="font-bold text-slate-900 mt-0.5">
//                     {viewModal.data.source || "Website"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase">
//                     Priority
//                   </p>
//                   <span
//                     className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewModal.data.priority === "High"
//                       ? "bg-rose-50 text-rose-700"
//                       : viewModal.data.priority === "Medium"
//                         ? "bg-amber-50 text-amber-700"
//                         : "bg-slate-50 text-slate-700"
//                       }`}
//                   >
//                     {viewModal.data.priority || "Medium"}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase">
//                     Created At
//                   </p>
//                   <p className="font-bold text-slate-900 mt-0.5">
//                     {viewModal.data.createdAt
//                       ? new Date(viewModal.data.createdAt).toLocaleDateString()
//                       : "-"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </LeadModal>
//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect, useCallback, useContext } from "react";
import { leadService } from "../services/leadService";
import LeadTable from "../components/leads/LeadTable";
import LeadModal from "../components/leads/LeadModal";
import LeadForm from "../components/leads/leadFrom";
import Pagination from "../components/common/pagination";
import { WorkspaceContext } from "../context/WorkCountContext";
import * as XLSX from "xlsx";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const { setTotalLeads } = useContext(WorkspaceContext);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
  });

  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [isLoading, setIsLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await leadService.fetchLeads({
        ...filters,
        page: filters.page,
        limit: 10,
      });

      const result = response?.data ?? response;
      const leadsData = Array.isArray(result?.leads) ? result.leads : [];
      const apiPagination = result?.pagination || {};

      const totalItems = Number(
        apiPagination.totalLeads ?? apiPagination.totalItems ?? 0
      );
      const totalPages = Math.ceil(totalItems / 10);

      if (totalPages > 0 && filters.page > totalPages) {
        setFilters((prev) => ({
          ...prev,
          page: totalPages,
        }));
        return;
      }

      setLeads(leadsData);
      setPagination({
        currentPage: filters.page,
        totalPage: totalPages,
        totalPages: totalPages,
        totalLeads: totalItems,
        totalItems: totalItems,
        limit: 10,
      });

      setTotalLeads(totalItems);
    } catch (err) {
      console.error("Load leads failed:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, setTotalLeads]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleFormSubmit = async (formData) => {
    try {
      if (modal.data) {
        await leadService.updateLead(modal.data._id, formData);
        setModal({ isOpen: false, data: null });
        await loadLeads();
      } else {
        await leadService.createLead(formData);
        setModal({ isOpen: false, data: null });
        setFilters((prev) => ({
          ...prev,
          page: 1,
        }));
      }
    } catch (err) {
      console.error("Submit failed:", err);
      alert(
        err.response?.data?.message || "Unable to save lead. Please try again."
      );
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await leadService.patchStatus(id, nextStatus);
      loadLeads();
    } catch (err) {
      alert(err.message || "State machine rule violation encountered.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently wipe this lead record?")) {
      return;
    }
    try {
      await leadService.deleteLead(id);
      await loadLeads();
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        error.response?.data?.message ||
          "Lead delete failed. Please try again."
      );
    }
  };

  const handleView = (lead) => {
    setViewModal({ isOpen: true, data: lead });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleExportCSV = async () => {
    try {
      setIsLoading(true);
      let allLeads = [];
      let currentPages = 1;
      let totalPages = 1;

      do {
        const response = await leadService.fetchLeads({
          ...filters,
          page: currentPages,
          limit: 10,
        });
        const result = response?.data ?? response;
        const LeadsData = Array.isArray(result?.leads) ? result.leads : [];
        const apiPagination = result?.pagination || {};

        totalPages = apiPagination.totalPages || apiPagination.totalPage || 1;
        if (LeadsData.length > 0) {
          allLeads = [...allLeads, ...LeadsData];
        }
        currentPages++;
      } while (currentPages <= totalPages);

      if (allLeads.length === 0) {
        alert("No data found to download.");
        return;
      }

      const headers = [
        "Name", "Company", "Email", "Phone", "Assigned To", "Status", "Source",
        "Priority", "Created At", "Total Follow-ups", "Follow-up Titles",
        "Follow-Up Dates", "Follow-up Status", "Follow-up Notes",
      ];

      const rows = allLeads.map((lead) => {
        let assignedName = "Unassigned";
        if (lead.assignedEmployee) {
          if (typeof lead.assignedEmployee === "object" && lead.assignedEmployee !== null) {
            assignedName = lead.assignedEmployee.name || lead.assignedEmployee.username || "Unassigned";
          } else {
            assignedName = lead.assignedEmployee;
          }
        } else if (lead.assignedTo) {
          assignedName = typeof lead.assignedTo === "object" ? lead.assignedTo.name : lead.assignedTo;
        }

        const followUps = Array.isArray(lead.followUps) ? lead.followUps : [];
        const totalFollowUps = followUps.length;

        const fuTitles = followUps.length > 0 ? followUps.map((f) => f.title || "-").join(" | ") : "N/A";
        const fuDates = followUps.length > 0 ? followUps.map((f) => (f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "-")).join(" | ") : "N/A";
        const fuStatuses = followUps.length > 0 ? followUps.map((f) => f.status || "pending").join(" | ") : "N/A";
        const fuNotes = followUps.length > 0 ? followUps.map((f) => (f.notes ? String(f.notes).replace(/[\r\n]+/g, " ") : "-")).join(" | ") : "N/A";

        return [
          `"${lead.name || lead.Name || ""}"`,
          `"${lead.company || lead.Company || ""}"`,
          `"${lead.email || lead.Email || ""}"`,
          `"${lead.phone || lead.Phone || ""}"`,
          `"${assignedName}"`,
          `"${lead.status || "New"}"`,
          `"${lead.source || "Website"}"`,
          `"${lead.priority || "Medium"}"`,
          `"${lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""}"`,
          `"${totalFollowUps}"`,
          `"${fuTitles}"`,
          `"${fuDates}"`,
          `"${fuStatuses}"`,
          `"${fuNotes}"`,
        ];
      });

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `leads_and_followups_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("CSV Export error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: true,
        rawNumbers: false,
      });

      if (!rows.length) {
        alert("Excel file is empty.");
        return;
      }

      const normalize = (value) =>
        String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");

      const importLeads = rows.map((row) => {
        const normalizedRow = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[normalize(key)] = row[key];
        });

        const validStatuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Nurturing", "Lost", "Won"];
        const validPriorities = ["Low", "Medium", "High"];
        const validSources = ["Website", "Inbound call", "Social Media", "Referral", "Cold Outreach", "Other"];

        let rawStatus = normalizedRow.status || "New";
        let formattedStatus = validStatuses.find((s) => s.toLowerCase() === rawStatus.toLowerCase()) || "New";

        let rawPriority = normalizedRow.priority || "Medium";
        let formattedPriority = validPriorities.find((p) => p.toLowerCase() === rawPriority.toLowerCase()) || "Medium";

        let rawSource = normalizedRow.source || "Website";
        let formattedSource = validSources.find((src) => src.toLowerCase() === rawSource.toLowerCase()) || "Website";

        let phoneVal = normalizedRow.phone || normalizedRow.phonenumber || "";
        if (typeof phoneVal === "number") {
          phoneVal = phoneVal.toLocaleString("fullwide", { useGrouping: false });
        }

        return {
          name: normalizedRow.name || normalizedRow.fullname || "",
          company: normalizedRow.company || "",
          email: normalizedRow.email || normalizedRow.emailaddress || "",
          phone: String(phoneVal).trim(),
          assignedTo: normalizedRow.assignedEmployee || normalizedRow.assignedTo || "",
          source: formattedSource,
          status: formattedStatus,
          priority: formattedPriority,
        };
      });

      const validLeads = importLeads.filter((lead) => lead.name && lead.email);
      if (!validLeads.length) {
        alert("No valid leads found. Name and Email are required.");
        return;
      }

      let successCount = 0;
      let failedCount = 0;

      for (const lead of validLeads) {
        try {
          await leadService.createLead(lead);
          successCount++;
        } catch (err) {
          failedCount++;
          console.error("Import failed:", lead.email, err.response?.data || err.message);
        }
      }

      setFilters((prev) => ({
        ...prev,
        page: 1,
      }));

      alert(`Import completed!\nSuccessful: ${successCount}\nFailed: ${failedCount}`);
      await loadLeads();
    } catch (err) {
      console.error("Excel import error:", err);
      alert("Unable to import excel file");
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-3 sm:p-6 selection:bg-indigo-600">
      <div className="w-full px-4 sm:px-6 py-6 mx-auto space-y-4 sm:space-y-6">
        {/* Responsive Header */}
        <header className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Lead Registry Control
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Monitor pipeline conversions, channels, and personnel assignments.
              </p>
            </div>

            {/* Mobile-friendly action buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
              <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm cursor-pointer transition">
                <span>📥 Import</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm cursor-pointer transition"
              >
                <span>📤 Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setModal({ isOpen: true, data: null })}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm cursor-pointer transition"
              >
                <span>+ Onboard New Lead</span>
              </button>
            </div>
          </div>

          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Total Registered
              </p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600 mt-0.5">
                {pagination?.totalItems || leads.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Active Displayed
              </p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600 mt-0.5">
                {leads.length}
              </p>
            </div>
          </div>
        </header>

        {/* Responsive Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="sm:col-span-2 md:col-span-6">
            <input
              type="text"
              placeholder="Search name, company, email..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none transition"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                  page: 1,
                }))
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none cursor-pointer"
            >
              <option value="">All Workflow Stages</option>
              {["New", "Contacted", "Qualified", "Proposal Sent", "Nurturing", "Lost", "Won"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-sm outline-none cursor-pointer"
            >
              <option value="createdAt-desc">Date Created (Newest)</option>
              <option value="createdAt-asc">Date Created (Oldest)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Leads Data Container (Cards on Mobile, Table on Desktop) */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs rounded-2xl flex items-center justify-center">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-lg">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <span className="text-xs font-semibold text-slate-700">
                  Fetching Records...
                </span>
              </div>
            </div>
          )}

          <LeadTable
            leads={leads}
            onEdit={(lead) => setModal({ isOpen: true, data: lead })}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onView={handleView}
          />

          <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </div>

        {/* Create / Edit Modal */}
        <LeadModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, data: null })}
          title={modal.data ? "Update Lead Profile" : "Register Target Lead"}
        >
          <LeadForm
            initialData={modal.data}
            onSubmit={handleFormSubmit}
            onClose={() => setModal({ isOpen: false, data: null })}
          />
        </LeadModal>

      
    {/* View Details Modal */}
        <LeadModal
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, data: null })}
          title="Lead Full Details & Activity History"
        >
          {viewModal.data && (() => {
            const lead = viewModal.data;
            const assignedName = typeof lead.assignedEmployee === "object" && lead.assignedEmployee !== null 
              ? (lead.assignedEmployee?.name || lead.assignedEmployee.username || lead.assignedEmployee.email) 
              : (lead.assignedEmployee || lead.assignedTo || "Unassigned");
            
            const createdDate = lead.createdAt 
              ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
              : 'N/A';
            
            const followUps = Array.isArray(lead.followUps) ? lead.followUps : [];

            return (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                {/* Main Lead Information Grid */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Basic Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Full Name</p>
                      <p className="font-bold text-slate-900 mt-0.5">{lead.name || lead.Name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Company</p>
                      <p className="font-bold text-slate-900 mt-0.5">{lead.company || lead.Company || "No Company"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Email</p>
                      <p className="font-bold text-slate-900 mt-0.5 break-all">{lead.email || lead.Email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Phone</p>
                      <p className="font-bold text-slate-900 mt-0.5">{lead.phone || lead.Phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Status</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {lead.status || "New"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Priority</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        (lead.priority || "").toLowerCase() === 'high' || (lead.priority || "").toLowerCase() === 'urgent' ? 'bg-rose-50 text-rose-700' :
                        (lead.priority || "").toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.priority || "Medium"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Source</p>
                      <p className="font-bold text-slate-900 mt-0.5">{lead.source || "Website"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Assigned To</p>
                      <p className="font-bold text-slate-900 mt-0.5">{assignedName}</p>
                    </div> 
                    <div className="sm:col-span-2">
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Created At</p>
                      <p className="font-medium text-slate-700 mt-0.5">{createdDate}</p>
                    </div>
                  </div>
                </div>

                {/* Follow-ups Section (Shows all follow-up items with details) */}
                {followUps.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Follow-up Activities ({followUps.length})
                    </p>
                    <div className="space-y-3">
                      {followUps.map((fu, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-50 border
                         border-slate-200/80 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 text-sm">
                              #{idx + 1}: {fu.title || "Untitled Follow-up"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50
                             text-indigo-700 font-semibold uppercase text-[10px]">
                              {fu.status || "Pending"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 
                          border-t border-slate-200/60">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase 
                              font-semibold">Date & Time:</span>
                              <p className="font-medium text-slate-700">
                                {fu.dueDate ? new Date(fu.dueDate).toLocaleDateString()
                                 : "N/A"} {fu.dueTime || fu.time || ""}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase
                               font-semibold">Activity Type:</span>
                              <p className="font-medium text-slate-700">
                                {fu.activityType || fu.type || "Call"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase
                               font-semibold">Priority:</span>
                              <p className="font-medium text-slate-700">
                                {fu.priority || "Medium"}</p>
                            </div>
                          </div>

                          {fu.notes && (
                            <div className="pt-1">
                              <span className="text-[10px] text-slate-400 uppercase
                               font-semibold">Notes:</span>
                              <p className="text-slate-600 italic bg-white p-2 
                              rounded border border-slate-200 mt-0.5">
                                "{fu.notes}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Dispatch Section Info (If stored or logged in lead) */}
                {(lead.lastEmailSubject || lead.emailMessage || lead.emailSubject) && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50
                   space-y-2">
                    <p className="text-xs font-bold text-slate-700 uppercase 
                    tracking-wider">Last Dispatched Email</p>
                    <div className="p-3 bg-white rounded-lg border
                     border-slate-200 text-xs space-y-1">
                      <p><strong className="text-slate-500">Subject:</strong>
                       <span className="text-slate-900 font-semibold">
                        {lead.emailSubject || lead.lastEmailSubject || "N/A"}
                        </span></p>
                      <p><strong className="text-slate-500">Message:</strong>
                       <span className="text-slate-700">{lead.emailMessage || 
                       lead.lastEmailMessage || "N/A"}</span></p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </LeadModal>
      </div>
    </div>
  );
}