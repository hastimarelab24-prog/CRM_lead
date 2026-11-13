// import React, { useEffect, useState } from "react";
// import { apiRequest } from "../../api/api";

// const SOURCES = [
//   "website",
//   "referral",
//   "cold outreach",
//   "inbound call",
//   "social media",
// ];

// const STATUSES = [
//   "new",
//   "contacted",
//   "qualified",
//   "proposal sent",
//   "nurturing",
//   "lost",
//   "won",
// ];

// const createEmptyFollowUp = () => ({
//   title: "",
//   dueDate: "",
//   dueTime: "",
//   type: "call",
//   priority: "Medium",
//   notes: "",
// });

// const INITIAL_FORM = {
//   name: "",
//   company: "",
//   email: "",
//   phone: "",
//   source: "",
//   status: "new",
//   assignedEmployee: "",
//   followUps: [createEmptyFollowUp()],
// };

// const formatDate = (value) => {
//   if (!value) return "";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "";

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const formatTime = (value) => {
//   if (!value) return "";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "";

//   return `${String(date.getHours()).padStart(2, "0")}:${String(
//     date.getMinutes()
//   ).padStart(2, "0")}`;
// };

// const getInitialFollowUps = (initialData) => {
//   if (Array.isArray(initialData?.followUps) && initialData.followUps.length) {
//     return initialData.followUps.map((item) => {
//       const dateValue = item.dueDate || item.followUpDate || "";

//       return {
//         title: item.title || "",
//         dueDate: formatDate(dateValue),
//         dueTime: item.dueTime || formatTime(dateValue),
//         type: String(item.type || item.activityType || "call").toLowerCase(),
//         priority: item.priority || "Medium",
//         notes: item.notes || item.followUpNote || "",
//       };
//     });
//   }

//   if (initialData?.followUpDate) {
//     return [
//       {
//         title: initialData.followUpTitle || "Scheduled Follow-up",
//         dueDate: formatDate(initialData.followUpDate),
//         dueTime:
//           initialData.followUpTime || formatTime(initialData.followUpDate),
//         type: String(
//           initialData.activityType || initialData.followUpType || "call"
//         ).toLowerCase(),
//         priority: initialData.priority || "Medium",
//         notes: initialData.followUpNote || "",
//       },
//     ];
//   }

//   return [createEmptyFollowUp()];
// };

// export default function LeadForm({
//   initialData = null,
//   onSubmit,
//   onClose,
// }) {
//   const [formData, setFormData] = useState({ ...INITIAL_FORM });
//   const [errors, setErrors] = useState({});
//   const [saving, setSaving] = useState(false);
//   const [submitError, setSubmitError] = useState("");
//   const [employees, setEmployees] = useState([]);
//   const [loadingEmployees, setLoadingEmployees] = useState(true);

//   // Email states
//   const [sendEmail, setSendEmail] = useState(false);
//   const [emailStatusMessange, setEmailStatusMessange] = useState("");
//   const [ccEmail, setCcEmail] = useState("");
//   const [showccSection, setShowCcSection] = useState(false);
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   // helper to add quick email chips to cc input safely
//   const handleAddQuickCc = (emailToAdd) => {
//     setCcEmail((prev) => {
//       if (!prev.trim()) return emailToAdd;
//       const currentList = prev.split(",").map((e) => e.trim()).filter(Boolean);
//       if (currentList.includes(emailToAdd)) return prev;
//       return [...currentList, emailToAdd].join(",")
//     })
//   }


//   useEffect(() => {
//     let cancelled = false;

//     const fetchEmployees = async () => {
//       try {
//         setLoadingEmployees(true);
//         const response = await apiRequest("get", "/users/employees");

//         const users = Array.isArray(response)
//           ? response
//           : response?.users || response?.data?.users || response?.data || [];

//         const employeeList = users.filter(
//           (user) => user.isActive !== false
//         );

//         if (!cancelled) {
//           setEmployees(employeeList);
//         }
//       } catch (error) {
//         console.error(
//           "Failed to load employees:",
//           error.response?.data || error.message
//         );

//         if (!cancelled) {
//           setSubmitError(
//             error.response?.data?.message ||
//             "Could not load employees. Check your login and permissions."
//           );
//         }
//       } finally {
//         if (!cancelled) {
//           setLoadingEmployees(false);
//         }
//       }
//     };

//     fetchEmployees();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   useEffect(() => {
//     if (initialData) {
//       const assignedEmployee =
//         typeof initialData.assignedEmployee === "object"
//           ? initialData.assignedEmployee?._id || ""
//           : initialData.assignedEmployee || "";

//       setFormData({
//         name: initialData.name || "",
//         company: initialData.company || "",
//         email: initialData.email || "",
//         phone: initialData.phone || "",
//         source: initialData.source || "",
//         status: initialData.status || "new",
//         assignedEmployee,
//         followUps: getInitialFollowUps(initialData),
//       });
//     } else {
//       setFormData({
//         ...INITIAL_FORM,
//         followUps: [createEmptyFollowUp()],
//       });
//     }

//     setErrors({});
//     setSubmitError("");
//   }, [initialData]);

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     setErrors((previous) => ({
//       ...previous,
//       [name]: "",
//     }));

//     setSubmitError("");
//   };

//   const handleDirectSendEmail = async () => {
//     const targetEmail = formData.email ? formData.email.trim() : "";
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!targetEmail || !emailRegex.test(targetEmail)) {
//       setEmailStatusMessange("Please insert a correct email into it.");
//       return;
//     }

//     const trimmedCc = ccEmail.trim();
//     if (trimmedCc) {
//       const ccList = trimmedCc.split(",").map((e) => e.trim()).filter(Boolean);
//       const invalidCc = ccList.find((e) => !emailRegex.test(e));
//       if (invalidCc) {
//         setEmailStatusMessange(`Invalid CC email format: ${invalidCc}`);
//         return;
//       }
//     }

//     try {
//       setSendEmail(true);
//       setEmailStatusMessange("");
//       const response = await apiRequest("post", "/leads/send-email", {
//         email: targetEmail,
//         name: formData.name ? formData.name.trim() : "lead",
//         company: formData.company ? formData.company.trim() : "",
//         subject: emailSubject.trim(),
//         message: emailMessage.trim(),
//         ...(trimmedCc ? { cc: trimmedCc } : {}),
//       });

//       if (response?.success) {
//         setEmailStatusMessange("Email has been sent successfully from hastimarelab24@gmail.com!");
//       } else {
//         setEmailStatusMessange(response?.message || "The email was not sent successfully.");
//       }
//     } catch (err) {
//       console.error("send email error:", err);
//       setEmailStatusMessange(err.response?.data?.message || "A mistake has happened");
//     } finally {
//       setSendEmail(false);
//     }
//   };

//   const handleFollowUpChange = (index, field, value) => {
//     setFormData((previous) => ({
//       ...previous,
//       followUps: previous.followUps.map((followUp, i) =>
//         i === index
//           ? {
//             ...followUp,
//             [field]: value,
//           }
//           : followUp
//       ),
//     }));

//     setErrors((previous) => ({
//       ...previous,
//       [`followUps.${index}.${field}`]: "",
//     }));

//     setSubmitError("");
//   };

//   const addFollowUpRow = () => {
//     setFormData((previous) => ({
//       ...previous,
//       followUps: [
//         ...previous.followUps,
//         createEmptyFollowUp(),
//       ],
//     }));
//   };

//   const removeFollowUpRow = (index) => {
//     setFormData((previous) => ({
//       ...previous,
//       followUps: previous.followUps.filter((_, i) => i !== index),
//     }));

//     setErrors({});
//   };

//   const validateForm = () => {
//     const nextErrors = {};

//     if (formData.name.trim().length < 2) {
//       nextErrors.name = "Name must be at least 2 characters.";
//     }

//     if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
//       nextErrors.email = "Email is required.";
//     }

//     if (!SOURCES.includes(formData.source)) {
//       nextErrors.source = "Please select a lead source.";
//     }

//     if (!STATUSES.includes(formData.status)) {
//       nextErrors.status = "Please select a lead status.";
//     }

//     if (!formData.assignedEmployee) {
//       nextErrors.assignedEmployee = "Please select an employee.";
//     }

//     return nextErrors;
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (saving) return;

//     setErrors({});
//     setSubmitError("");

//     const validationErrors = validateForm();

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     const formattedFollowUps = formData.followUps
//       .filter(
//         (item) =>
//           item.title.trim() ||
//           item.dueDate ||
//           item.dueTime ||
//           item.notes.trim()
//       )
//       .map((item) => {
//         const dateTime = new Date(
//           `${item.dueDate}T${item.dueTime || "00:00"}:00`
//         );

//         return {
//           title: item.title.trim(),
//           dueDate: dateTime.toISOString(),
//           type: item.type,
//           activityType: item.type,
//           priority: item.priority.toLowerCase(),
//           notes: item.notes.trim(),
//         };
//       });

//     const firstFollowUp = formattedFollowUps[0] || null;

//     const payload = {
//       name: formData.name.trim(),
//       company: formData.company.trim(),
//       email: formData.email.trim().toLowerCase(),
//       phone: formData.phone.trim(),
//       source: formData.source,
//       status: formData.status,
//       assignedEmployee: formData.assignedEmployee,
//       followUps: formattedFollowUps,
//       followUpDate: firstFollowUp?.dueDate || null,
//       followUpTime: firstFollowUp
//         ? firstFollowUp.dueDate.substring(11, 16)
//         : "",
//       activityType: firstFollowUp?.type || "",
//       priority: firstFollowUp?.priority || "medium",
//       followUpNote: firstFollowUp?.notes || "",
//     };

//     try {
//       setSaving(true);

//       if (typeof onSubmit !== "function") {
//         throw new Error("Lead submit handler is missing.");
//       }

//       if (initialData) {
//         await onSubmit(payload);
//         return;
//       }

//       const response = await onSubmit({
//         ...payload,
//         allowDuplicate: false,
//       });

//       if (
//         response?.duplicate === true &&
//         response?.requireConfirmation === true
//       ) {
//         const existingLead = response.existingLead || {};

//         const userConfirmed = window.confirm(
//           `${response.message || "A lead with the same details already exists."}\n\n` +
//           `Existing Lead:\n` +
//           `Name: ${existingLead.name || "N/A"}\n` +
//           `Email: ${existingLead.email || "N/A"}\n\n` +
//           `Do you want to create a new entry anyway?`
//         );

//         if (userConfirmed) {
//           const duplicateResponse = await onSubmit({
//             ...payload,
//             allowDuplicate: true,
//           });

//           if (duplicateResponse?.success) {
//             alert("New entry created successfully.");
//             return;
//           }

//           throw new Error(
//             duplicateResponse?.message ||
//             "Failed to create new entry."
//           );
//         }
//         return;
//       }

//       if (response?.success) {
//         alert("Lead created successfully.");
//         return;
//       }

//       throw new Error(
//         response?.message || "Unable to save lead."
//       );
//     } catch (error) {
//       console.error(
//         "Save lead failed:",
//         error.response?.data || error
//       );

//       setSubmitError(
//         error.response?.data?.message ||
//         error.message ||
//         "Unable to save lead. Please try again."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const inputClass =
//     "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100";

//   const labelClass =
//     "mb-1.5 block text-sm font-semibold text-gray-700";

//   const renderError = (field) =>
//     errors[field] ? (
//       <p className="mt-1 text-xs text-red-600" role="alert">
//         {errors[field]}
//       </p>
//     ) : null;

//   return (
//     <form
//       onSubmit={handleSubmit}
//       noValidate
//       className="w-[90vw] max-w-5xl h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl bg-white p-5 sm:p-7"
//     >
//       <div>
//         <h2 className="text-xl font-bold text-gray-900">
//           {initialData ? "Update Lead" : "Register New Lead"}
//         </h2>
//         <p className="mt-1 text-sm text-gray-500">
//           Enter lead details, select an employee and schedule follow-ups.
//         </p>
//       </div>

//       {submitError && (
//         <div
//           role="alert"
//           className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
//         >
//           {submitError}
//         </div>
//       )}

//       {/* Main Details Grid */}
//       <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-4">
//         <div>
//           <label htmlFor="name" className={labelClass}>
//             Full Name *
//           </label>
//           <input
//             id="name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter full name"
//             required
//             minLength={2}
//             className={inputClass}
//             aria-invalid={Boolean(errors.name)}
//           />
//           {renderError("name")}
//         </div>

//         <div>
//           <label htmlFor="company" className={labelClass}>
//             Company
//           </label>
//           <input
//             id="company"
//             name="company"
//             value={formData.company}
//             onChange={handleChange}
//             placeholder="Enter company name"
//             className={inputClass}
//           />
//         </div>

//         <div>
//           <label htmlFor="email" className={labelClass}>
//             Email Address *
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="name@example.com"
//             required
//             className={inputClass}
//             aria-invalid={Boolean(errors.email)}
//           />
//           {renderError("email")}
//         </div>

//         <div>
//           <label htmlFor="phone" className={labelClass}>
//             Phone Number
//           </label>
//           <input
//             id="phone"
//             name="phone"
//             type="tel"
//             value={formData.phone}
//             onChange={handleChange}
//             placeholder="Enter phone number"
//             className={inputClass}
//           />
//         </div>

//         <div>
//           <label htmlFor="source" className={labelClass}>
//             Lead Source *
//           </label>
//           <select
//             id="source"
//             name="source"
//             value={formData.source}
//             onChange={handleChange}
//             required
//             className={inputClass}
//             aria-invalid={Boolean(errors.source)}
//           >
//             <option value="">Select lead source</option>
//             {SOURCES.map((source) => (
//               <option key={source} value={source}>
//                 {source.replace(/\b\w/g, (char) => char.toUpperCase())}
//               </option>
//             ))}
//           </select>
//           {renderError("source")}
//         </div>

//         <div>
//           <label htmlFor="status" className={labelClass}>
//             Lead Status *
//           </label>
//           <select
//             id="status"
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//             required
//             className={inputClass}
//             aria-invalid={Boolean(errors.status)}
//           >
//             {STATUSES.map((status) => (
//               <option key={status} value={status}>
//                 {status.replace(/\b\w/g, (char) => char.toUpperCase())}
//               </option>
//             ))}
//           </select>
//           {renderError("status")}
//         </div>

//         <div className="md:col-span-2">
//           <label htmlFor="assignedEmployee" className={labelClass}>
//             Assigned Employee *
//           </label>
//           <select
//             id="assignedEmployee"
//             name="assignedEmployee"
//             value={formData.assignedEmployee}
//             onChange={handleChange}
//             required
//             disabled={loadingEmployees}
//             className={inputClass}
//             aria-invalid={Boolean(errors.assignedEmployee)}
//           >
//             <option value="">
//               {loadingEmployees
//                 ? "Loading employees..."
//                 : employees.length
//                   ? "Select Employee"
//                   : "No active employees found"}
//             </option>
//             {employees.map((employee) => (
//               <option
//                 key={employee._id || employee.id}
//                 value={employee._id || employee.id}
//               >
//                 {employee.name} ({employee.email})
//               </option>
//             ))}
//           </select>
//           {renderError("assignedEmployee")}
//         </div>
//       </div>

//       {/* Multiple Follow-ups Section */}
//       <div className="border-t border-gray-200 mt-6 pt-5">
//         <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//           <div>
//             <h3 className="text-lg font-bold text-gray-800">
//               Follow-up Details
//             </h3>
//             <p className="mt-1 text-xs text-gray-500">
//               Add multiple follow-up activities for this lead.
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={addFollowUpRow}
//             disabled={saving}
//             className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50"
//           >
//             + Add Follow-up
//           </button>
//         </div>

//         <div className="space-y-4">
//           {formData.followUps.map((followUp, index) => (
//             <div
//               key={index}
//               className="relative space-y-3 rounded-xl border border-gray-200 bg-slate-50 p-4"
//             >
//               <div className="flex items-center justify-between">
//                 <h4 className="text-sm font-bold text-gray-700">
//                   Follow-up #{index + 1}
//                 </h4>
//                 {formData.followUps.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => removeFollowUpRow(index)}
//                     disabled={saving}
//                     className="text-xs font-semibold text-red-600 hover:text-red-800"
//                   >
//                     <span className="mr-1">✕</span> Remove
//                   </button>
//                 )}
//               </div>

//               <div>
//                 <label className={labelClass}>Follow-up Title *</label>
//                 <input
//                   type="text"
//                   value={followUp.title}
//                   onChange={(e) =>
//                     handleFollowUpChange(index, "title", e.target.value)
//                   }
//                   placeholder="Enter follow-up title"
//                   className={inputClass}
//                 />
//               </div>

//               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                 <div>
//                   <label className={labelClass}>Follow-up Date *</label>
//                   <input
//                     type="date"
//                     value={followUp.dueDate}
//                     onChange={(e) =>
//                       handleFollowUpChange(index, "dueDate", e.target.value)
//                     }
//                     className={inputClass}
//                   />
//                 </div>
//                 <div>
//                   <label className={labelClass}>Follow-up Time</label>
//                   <input
//                     type="time"
//                     value={followUp.dueTime}
//                     onChange={(e) =>
//                       handleFollowUpChange(index, "dueTime", e.target.value)
//                     }
//                     className={inputClass}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                 <div>
//                   <label className={labelClass}>Activity Type</label>
//                   <select
//                     value={followUp.type}
//                     onChange={(e) =>
//                       handleFollowUpChange(index, "type", e.target.value)
//                     }
//                     className={inputClass}
//                   >
//                     <option value="call">Call</option>
//                     <option value="email">Email</option>
//                     <option value="meeting">Meeting</option>
//                     <option value="task">Task</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className={labelClass}>Priority</label>
//                   <select
//                     value={followUp.priority}
//                     onChange={(e) =>
//                       handleFollowUpChange(index, "priority", e.target.value)
//                     }
//                     className={inputClass}
//                   >
//                     <option value="Low">Low</option>
//                     <option value="Medium">Medium</option>
//                     <option value="High">High</option>
//                     <option value="Urgent">Urgent</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className={labelClass}>Follow-up Notes</label>
//                 <textarea
//                   value={followUp.notes}
//                   onChange={(e) =>
//                     handleFollowUpChange(index, "notes", e.target.value)
//                   }
//                   placeholder="Enter follow-up remarks..."
//                   rows={2}
//                   className={inputClass}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Email Dispatch Section */}
//       <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-base font-bold text-blue-900">Email dispatch section</h3>
//             <p className="mt-1 text-xs text-blue-700">
//               Check the provided email, add custom subject/message, and click Send Email.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={() => setShowCcSection((prev) => !prev)}
//             className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
//           >
//             <span>{showccSection ? "Hide CC" : "Add CC"}</span>
//             <svg
//               className={`h-3.5 w-3.5 transition-transform duration-200 ${showccSection ? "rotate-180" : "rotate-0"
//                 }`}
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
//             </svg>
//           </button>
//         </div>

//         <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <div>
//             <label className="mb-1 block text-xs font-semibold text-blue-900">From</label>
//             <input
//               type="email"
//               value="hastimarelab24@gmail.com"
//               disabled
//               className="w-full rounded-lg border border-blue-200 bg-blue-100 px-3 py-2 text-xs font-bold text-gray-700"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-xs font-semibold text-blue-900">To</label>
//             <input
//               type="email"
//               value={formData.email}
//               readOnly
//               placeholder="The lead email will appear here"
//               className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-gray-900"
//             />
//           </div>
//         </div>

//         {/* Custom Subject */}
//         <div className="mt-4">
//           <label className="mb-1 block text-xs font-semibold text-blue-900">Email Subject</label>
//           <input
//             type="text"
//             value={emailSubject}
//             onChange={(e) => setEmailSubject(e.target.value)}
//             placeholder="Enter email subject (optional)"
//             className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
//           />
//         </div>

//         {/* Custom Message */}
//         <div className="mt-4">
//           <label className="mb-1 block text-xs font-semibold text-blue-900">Email Message</label>
//           <textarea
//             value={emailMessage}
//             onChange={(e) => setEmailMessage(e.target.value)}
//             placeholder="Enter custom email message (optional)"
//             rows={3}
//             className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
//           />
//         </div>

//         {/* CC Section Box */}
//         {showccSection && (
//           <div className="mt-4 rounded-lg border border-indigo-200 bg-white p-3.5 shadow-sm">
//             <div className="flex items-center justify-between gap-2">
//               <label className="block text-xs font-bold text-indigo-900">CC (Carbon Copy)</label>
//               <span className="text-[11px] text-gray-500">
//                 Multiple emails: use comma (,)
//               </span>
//             </div>
//             <input
//               type="text"
//               value={ccEmail}
//               placeholder="manager@example.com, team@example.com"
//               onChange={(e) => setCcEmail(e.target.value)}
//               className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//             />

//             {/* quick select button  */}
//             <div className="mt-2.5 flex flex-wrap items-center
//              gap-1.5">
//               <span className="text-[11px] font-semibold
//                text-gray-600 mr-1">Quick Add:</span>
//               <button
//                 type="button"
//                 onClick={() => handleAddQuickCc("amishamarelab@gmail.com")}
//                 className="rounded-md bg-indigo-50 px-2 py-1
//                  text-[11px] font-medium text-indigo-700 
//                  transition hover:bg-indigo-100 border
//                   border-indigo-100"
//               >
//                 + amishamarelab@gmail.com
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleAddQuickCc("hastivadodariya1202@gmail.com")}
//                 className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100 border border-indigo-100"
//               >
//                 + hastivadodariya1202@gmail.com
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleAddQuickCc("hastimarelab24@gmail.com")}
//                 className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100 border border-indigo-100"
//               >
//                 + hastimarelab24@gmail.com
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="mt-4 flex items-center justify-between">
//           <button
//             type="button"
//             onClick={handleDirectSendEmail}
//             disabled={sendEmail || !formData.email}
//             className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
//           >
//             {sendEmail ? "Sending..." : "Send Email"}
//           </button>

//           {emailStatusMessange && (
//             <p
//               className={`text-xs font-semibold ${emailStatusMessange.toLowerCase().includes("successfully") ||
//                   emailStatusMessange.toLowerCase().includes("sent to")
//                   ? "text-green-600"
//                   : "text-red-600"
//                 }`}
//             >
//               {emailStatusMessange}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="flex flex-col-reverse gap-3 border-t border-gray-200 mt-6 pt-4 sm:flex-row sm:justify-end">
//         <button
//           type="button"
//           onClick={onClose}
//           disabled={saving}
//           className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={saving || loadingEmployees}
//           className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           {saving ? "Saving..." : initialData ? "Update Lead" : "Save Lead"}
//         </button>
//       </div>
//     </form>
//   );
// }
import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/api";

const SOURCES = [
  "website",
  "referral",
  "cold outreach",
  "inbound call",
  "social media",
];

const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal sent",
  "nurturing",
  "lost",
  "won",
];

const createEmptyFollowUp = () => ({
  title: "",
  dueDate: "",
  dueTime: "",
  type: "call",
  priority: "Medium",
  notes: "",
});

const INITIAL_FORM = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "",
  status: "new",
  assignedEmployee: "",
  followUps: [createEmptyFollowUp()],
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const getInitialFollowUps = (initialData) => {
  if (Array.isArray(initialData?.followUps) && initialData.followUps.length) {
    return initialData.followUps.map((item) => {
      const dateValue = item.dueDate || item.followUpDate || "";

      return {
        title: item.title || "",
        dueDate: formatDate(dateValue),
        dueTime: item.dueTime || formatTime(dateValue),
        type: String(item.type || item.activityType || "call").toLowerCase(),
        priority: item.priority || "Medium",
        notes: item.notes || item.followUpNote || "",
      };
    });
  }

  if (initialData?.followUpDate) {
    return [
      {
        title: initialData.followUpTitle || "Scheduled Follow-up",
        dueDate: formatDate(initialData.followUpDate),
        dueTime:
          initialData.followUpTime || formatTime(initialData.followUpDate),
        type: String(
          initialData.activityType || initialData.followUpType || "call"
        ).toLowerCase(),
        priority: initialData.priority || "Medium",
        notes: initialData.followUpNote || "",
      },
    ];
  }

  return [createEmptyFollowUp()];
};

export default function LeadForm({
  initialData = null,
  onSubmit,
  onClose,
}) {
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Email states
  const [sendEmail, setSendEmail] = useState(false);
  const [emailStatusMessange, setEmailStatusMessange] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [showccSection, setShowCcSection] = useState(false);
  const [showBccSection, setShowBCcSection] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const handleAddQuickCc = (emailToAdd) => {
    setCcEmail((prev) => {
      if (!prev.trim()) return emailToAdd;
      const currentList = prev.split(",").map((e) => e.trim()).filter(Boolean);
      if (currentList.includes(emailToAdd)) return prev;
      return [...currentList, emailToAdd].join(",");
    });
  };

  const handleAddQuickBcc = (emailToAdd) => {
    setBccEmail((prev) => {
      if (!prev.trim()) return emailToAdd;
      const currentList = prev.split(",").map((e) => e.trim()).filter(Boolean);
      if (currentList.includes(emailToAdd)) return prev;
      return [...currentList, emailToAdd].join(",");
    });
  };

  useEffect(() => {
    let cancelled = false;

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await apiRequest("get", "/users/employees");

        const users = Array.isArray(response)
          ? response
          : response?.users || response?.data?.users || response?.data || [];

        const employeeList = users.filter(
          (user) => user.isActive !== false
        );

        if (!cancelled) {
          setEmployees(employeeList);
        }
      } catch (error) {
        console.error(
          "Failed to load employees:",
          error.response?.data || error.message
        );

        if (!cancelled) {
          setSubmitError(
            error.response?.data?.message ||
            "Could not load employees. Check your login and permissions."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
      }
    };

    fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      const assignedEmployee =
        typeof initialData.assignedEmployee === "object"
          ? initialData.assignedEmployee?._id || ""
          : initialData.assignedEmployee || "";

      setFormData({
        name: initialData.name || "",
        company: initialData.company || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        source: initialData.source || "",
        status: initialData.status || "new",
        assignedEmployee,
        followUps: getInitialFollowUps(initialData),
      });
    } else {
      setFormData({
        ...INITIAL_FORM,
        followUps: [createEmptyFollowUp()],
      });
    }

    setErrors({});
    setSubmitError("");
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleDirectSendEmail = async () => {
    const targetEmail = formData.email ? formData.email.trim() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!targetEmail || !emailRegex.test(targetEmail)) {
      setEmailStatusMessange("Please insert a correct email into it.");
      return;
    }

    const trimmedCc = ccEmail.trim();
    if (trimmedCc) {
      const ccList = trimmedCc.split(",").map((e) => e.trim()).filter(Boolean);
      const invalidCc = ccList.find((e) => !emailRegex.test(e));
      if (invalidCc) {
        setEmailStatusMessange(`Invalid CC email format: ${invalidCc}`);
        return;
      }
    }

    const trimmedBcc = bccEmail.trim();
    if (trimmedBcc) {
      const bccList = trimmedBcc.split(",").map((e) => e.trim()).filter(Boolean);
      const invalidBCc = bccList.find((e) => !emailRegex.test(e));
      if (invalidBCc) {
        setEmailStatusMessange(`Invalid BCC email format: ${invalidBCc}`);
        return;
      }
    }

    try {
      setSendEmail(true);
      setEmailStatusMessange("");
      const response = await apiRequest("post", "/leads/send-email", {
        email: targetEmail,
        name: formData.name ? formData.name.trim() : "lead",
        company: formData.company ? formData.company.trim() : "",
        subject: emailSubject.trim(),
        message: emailMessage.trim(),
        ...(trimmedCc ? { cc: trimmedCc } : {}),
        ...(trimmedBcc ? { bcc: trimmedBcc } : {}),
      });

      if (response?.success) {
        setEmailStatusMessange("Email has been sent successfully from hastimarelab24@gmail.com!");
      } else {
        setEmailStatusMessange(response?.message || "The email was not sent successfully.");
      }
    } catch (err) {
      console.error("send email error:", err);
      setEmailStatusMessange(err.response?.data?.message || "A mistake has happened");
    } finally {
      setSendEmail(false);
    }
  };

  const handleFollowUpChange = (index, field, value) => {
    setFormData((previous) => ({
      ...previous,
      followUps: previous.followUps.map((followUp, i) =>
        i === index
          ? {
              ...followUp,
              [field]: value,
            }
          : followUp
      ),
    }));

    setErrors((previous) => ({
      ...previous,
      [`followUps.${index}.${field}`]: "",
    }));

    setSubmitError("");
  };

  const addFollowUpRow = () => {
    setFormData((previous) => ({
      ...previous,
      followUps: [
        ...previous.followUps,
        createEmptyFollowUp(),
      ],
    }));
  };

  const removeFollowUpRow = (index) => {
    setFormData((previous) => ({
      ...previous,
      followUps: previous.followUps.filter((_, i) => i !== index),
    }));

    setErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};

    if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Email is required.";
    }

    if (!SOURCES.includes(formData.source)) {
      nextErrors.source = "Please select a lead source.";
    }

    if (!STATUSES.includes(formData.status)) {
      nextErrors.status = "Please select a lead status.";
    }

    if (!formData.assignedEmployee) {
      nextErrors.assignedEmployee = "Please select an employee.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setErrors({});
    setSubmitError("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formattedFollowUps = formData.followUps
      .filter(
        (item) =>
          item.title.trim() ||
          item.dueDate ||
          item.dueTime ||
          item.notes.trim()
      )
      .map((item) => {
        const dateTime = new Date(
          `${item.dueDate}T${item.dueTime || "00:00"}:00`
        );

        return {
          title: item.title.trim(),
          dueDate: dateTime.toISOString(),
          type: item.type,
          activityType: item.type,
          priority: item.priority.toLowerCase(),
          notes: item.notes.trim(),
        };
      });

    const firstFollowUp = formattedFollowUps[0] || null;

    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      source: formData.source,
      status: formData.status,
      assignedEmployee: formData.assignedEmployee,
      followUps: formattedFollowUps,
      followUpDate: firstFollowUp?.dueDate || null,
      followUpTime: firstFollowUp
        ? firstFollowUp.dueDate.substring(11, 16)
        : "",
      activityType: firstFollowUp?.type || "",
      priority: firstFollowUp?.priority || "medium",
      followUpNote: firstFollowUp?.notes || "",
    };

    try {
      setSaving(true);

      if (typeof onSubmit !== "function") {
        throw new Error("Lead submit handler is missing.");
      }

      if (initialData) {
        await onSubmit(payload);
        return;
      }

      const response = await onSubmit({
        ...payload,
        allowDuplicate: false,
      });

      if (
        response?.duplicate === true &&
        response?.requireConfirmation === true
      ) {
        const existingLead = response.existingLead || {};

        const userConfirmed = window.confirm(
          `${response.message || "A lead with the same details already exists."}\n\n` +
          `Existing Lead:\n` +
          `Name: ${existingLead.name || "N/A"}\n` +
          `Email: ${existingLead.email || "N/A"}\n\n` +
          `Do you want to create a new entry anyway?`
        );

        if (userConfirmed) {
          const duplicateResponse = await onSubmit({
            ...payload,
            allowDuplicate: true,
          });

          if (duplicateResponse?.success) {
            alert("New entry created successfully.");
            return;
          }

          throw new Error(
            duplicateResponse?.message ||
            "Failed to create new entry."
          );
        }
        return;
      }

      if (response?.success) {
        alert("Lead created successfully.");
        return;
      }

      throw new Error(
        response?.message || "Unable to save lead."
      );
    } catch (error) {
      console.error(
        "Save lead failed:",
        error.response?.data || error
      );

      setSubmitError(
        error.response?.data?.message ||
        error.message ||
        "Unable to save lead. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100";

  const labelClass =
    "mb-1.5 block text-xs sm:text-sm font-semibold text-gray-700";

  const renderError = (field) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className=" w-fullsm:w-[90vw] max-w-5xl bg-white p-4 sm:p-6"
    >
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {initialData ? "Update Lead" : "Register New Lead"}
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
          Enter lead details, select an employee and schedule follow-ups.
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700"
        >
          {submitError}
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
            minLength={2}
            className={inputClass}
            aria-invalid={Boolean(errors.name)}
          />
          {renderError("name")}
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>
            Company
          </label>
          <input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Enter company name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
            className={inputClass}
            aria-invalid={Boolean(errors.email)}
          />
          {renderError("email")}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="source" className={labelClass}>
            Lead Source *
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            required
            className={inputClass}
            aria-invalid={Boolean(errors.source)}
          >
            <option value="">Select lead source</option>
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {source.replace(/\b\w/g, (char) => char.toUpperCase())}
              </option>
            ))}
          </select>
          {renderError("source")}
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Lead Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className={inputClass}
            aria-invalid={Boolean(errors.status)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/\b\w/g, (char) => char.toUpperCase())}
              </option>
            ))}
          </select>
          {renderError("status")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="assignedEmployee" className={labelClass}>
            Assigned Employee *
          </label>
          <select
            id="assignedEmployee"
            name="assignedEmployee"
            value={formData.assignedEmployee}
            onChange={handleChange}
            required
            disabled={loadingEmployees}
            className={inputClass}
            aria-invalid={Boolean(errors.assignedEmployee)}
          >
            <option value="">
              {loadingEmployees
                ? "Loading employees..."
                : employees.length
                  ? "Select Employee"
                  : "No active employees found"}
            </option>
            {employees.map((employee) => (
              <option
                key={employee._id || employee.id}
                value={employee._id || employee.id}
              >
                {employee.name} ({employee.email})
              </option>
            ))}
          </select>
          {renderError("assignedEmployee")}
        </div>
      </div>

      {/* Multiple Follow-ups Section */}
      <div className="border-t border-gray-200 mt-6 pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              Follow-up Details
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Add multiple follow-up activities for this lead.
            </p>
          </div>
          <button
            type="button"
            onClick={addFollowUpRow}
            disabled={saving}
            className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50 cursor-pointer"
          >
            + Add Follow-up
          </button>
        </div>

        <div className="space-y-4">
          {formData.followUps.map((followUp, index) => (
            <div
              key={index}
              className="relative space-y-3 rounded-2xl border border-gray-200 bg-slate-50 p-3.5 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-gray-700">
                  Follow-up #{index + 1}
                </h4>
                {formData.followUps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFollowUpRow(index)}
                    disabled={saving}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <span className="mr-1">✕</span> Remove
                  </button>
                )}
              </div>

              <div>
                <label className={labelClass}>Follow-up Title *</label>
                <input
                  type="text"
                  value={followUp.title}
                  onChange={(e) =>
                    handleFollowUpChange(index, "title", e.target.value)
                  }
                  placeholder="Enter follow-up title"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Follow-up Date *</label>
                  <input
                    type="date"
                    value={followUp.dueDate}
                    onChange={(e) =>
                      handleFollowUpChange(index, "dueDate", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Follow-up Time</label>
                  <input
                    type="time"
                    value={followUp.dueTime}
                    onChange={(e) =>
                      handleFollowUpChange(index, "dueTime", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Activity Type</label>
                  <select
                    value={followUp.type}
                    onChange={(e) =>
                      handleFollowUpChange(index, "type", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select
                    value={followUp.priority}
                    onChange={(e) =>
                      handleFollowUpChange(index, "priority", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Follow-up Notes</label>
                <textarea
                  value={followUp.notes}
                  onChange={(e) =>
                    handleFollowUpChange(index, "notes", e.target.value)
                  }
                  placeholder="Enter follow-up remarks..."
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Dispatch Section */}
      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-blue-900">Email Dispatch Section</h3>
            <p className="mt-0.5 text-xs text-blue-700">
              Check the provided email, add custom subject/message, and click Send Email.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const newValue = !(showccSection || showBccSection);
              setShowCcSection(newValue);
              setShowBCcSection(newValue);
            }}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 cursor-pointer"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                showccSection || showBccSection ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-blue-900">From</label>
            <input
              type="email"
              value="hastimarelab24@gmail.com"
              disabled
              className="w-full rounded-xl border border-blue-200 bg-blue-100 px-3.5 py-2 text-xs font-bold text-gray-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-blue-900">To</label>
            <input
              type="email"
              value={formData.email}
              readOnly
              placeholder="The lead email will appear here"
              className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-900"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-semibold text-blue-900">Email Subject</label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Enter email subject (optional)"
            className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-semibold text-blue-900">Email Message</label>
          <textarea
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            placeholder="Enter custom email message (optional)"
            rows={3}
            className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
          />
        </div>

        {showccSection && (
          <div className="mt-3 rounded-xl border border-indigo-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-indigo-900">CC (Carbon Copy)</label>
              <span className="text-[11px] text-gray-500">Multiple: use comma (,)</span>
            </div>
            <input
              type="text"
              value={ccEmail}
              placeholder="manager@example.com, team@example.com"
              onChange={(e) => setCcEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-indigo-500"
            />

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-600 mr-1">Quick Add:</span>
              <button
                type="button"
                onClick={() => handleAddQuickCc("amishamarelab@gmail.com")}
                className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 border border-indigo-100 cursor-pointer"
              >
                + amishamarelab@gmail.com
              </button>
              <button
                type="button"
                onClick={() => handleAddQuickCc("hastivadodariya1202@gmail.com")}
                className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 border border-indigo-100 cursor-pointer"
              >
                + hastivadodariya1202@gmail.com
              </button>
              <button
                type="button"
                onClick={() => handleAddQuickCc("hastimarelab24@gmail.com")}
                className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 border border-indigo-100 cursor-pointer"
              >
                + hastimarelab24@gmail.com
              </button>
            </div>
          </div>
        )}

        {showBccSection && (
          <div className="mt-3 rounded-xl border border-purple-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-purple-900">BCC</label>
              <span className="text-[11px] text-gray-500">Multiple: use comma (,)</span>
            </div>

            <input
              type="text"
              value={bccEmail}
              placeholder="audit@example.com"
              onChange={(e) => setBccEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-500"
            />
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-600 mr-1">Quick add:</span>
              <button
                type="button"
                onClick={() => handleAddQuickBcc("hastimarelab24@gmail.com")}
                className="rounded-lg bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-100 border border-purple-100 cursor-pointer"
              >
                +hastimarelab24@gmail.com
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDirectSendEmail}
            disabled={sendEmail || !formData.email}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {sendEmail ? "Sending..." : "Send Email"}
          </button>

          {emailStatusMessange && (
            <p
              className={`text-xs font-semibold ${
                emailStatusMessange.toLowerCase().includes("successfully") ||
                emailStatusMessange.toLowerCase().includes("sent to")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {emailStatusMessange}
            </p>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col-reverse gap-2.5 border-t border-gray-200 mt-6 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || loadingEmployees}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : initialData ? "Update Lead" : "Save Lead"}
        </button>
      </div>
    </form>
  );
}