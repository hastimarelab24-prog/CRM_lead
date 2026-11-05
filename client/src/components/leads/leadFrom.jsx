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

// Format date for HTML date input using local time.
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

// Convert existing follow-up data into editable rows.
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

  // Backward compatibility with old single follow-up data.
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

  // Load employees.
  // Load employees/team members.
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

  // Load initial data and follow-ups when editing.
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

  // Basic lead field changes.
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

  // Update individual follow-up fields.
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

  // Add multiple follow-up rows.
  const addFollowUpRow = () => {
    setFormData((previous) => ({
      ...previous,
      followUps: [
        ...previous.followUps,
        createEmptyFollowUp(),
      ],
    }));
  };

  // Remove a follow-up row.
  const removeFollowUpRow = (index) => {
    setFormData((previous) => ({
      ...previous,
      followUps: previous.followUps.filter((_, i) => i !== index),
    }));

    setErrors({});
  };

  // Validate lead and follow-up data.
  const validateForm = () => {
    const nextErrors = {};

    if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
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

    formData.followUps.forEach((followUp, index) => {
      const hasContent =
        followUp.title.trim() ||
        followUp.dueDate ||
        followUp.dueTime ||
        followUp.notes.trim();

      if (!hasContent) return;

      if (!followUp.title.trim()) {
        nextErrors[`followUps.${index}.title`] =
          "Follow-up title is required.";
      }

      if (!followUp.dueDate) {
        nextErrors[`followUps.${index}.dueDate`] =
          "Follow-up date is required.";
      }

      if (
        !["call", "email", "meeting", "task"].includes(followUp.type)
      ) {
        nextErrors[`followUps.${index}.type`] =
          "Please select a valid activity type.";
      }
    });

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

  // Convert follow-up date and time to ISO format.
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

    // ==========================================
    // EDIT MODE
    // ==========================================
    if (initialData) {
      await onSubmit(payload);

      return;
    }

    // ==========================================
    // CREATE MODE - FIRST REQUEST
    // allowDuplicate = false
    // ==========================================
    const response = await onSubmit({
      ...payload,
      allowDuplicate: false,
    });

    // ==========================================
    // DUPLICATE FOUND
    // ==========================================
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

      // ==========================================
      // USER CLICKED YES
      // CREATE NEW ENTRY
      // ==========================================
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

      // ==========================================
      // USER CLICKED NO
      // DO NOTHING
      // ==========================================
      return;
    }

    // ==========================================
    // NORMAL SUCCESS
    // ==========================================
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
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100";

  const labelClass =
    "mb-1.5 block text-sm font-semibold text-gray-700";

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
      className="flex flex-col gap-5 rounded-xl bg-white p-5 sm:p-7"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? "Update Lead" : "Register New Lead"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter lead details, select an employee and schedule follow-ups.
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      )}

      {/* Name */}
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

      {/* Company */}
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

      {/* Email */}
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

      {/* Phone */}
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

      {/* Lead Source */}
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

      {/* Lead Status */}
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

      {/* Assigned Employee */}
      <div>
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

      {/* Multiple Follow-ups Section */}
      <div className="border-t border-gray-200 pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Follow-up Details
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Add multiple follow-up activities for this lead.
            </p>
          </div>
          <button
            type="button"
            onClick={addFollowUpRow}
            disabled={saving}
            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50"
          >
            + Add Follow-up
          </button>
        </div>

        <div className="space-y-4">
          {formData.followUps.map((followUp, index) => (
            <div
              key={index}
              className="relative space-y-3 rounded-xl border border-gray-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700">
                  Follow-up #{index + 1}
                </h4>
                {formData.followUps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFollowUpRow(index)}
                    disabled={saving}
                    className="text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    <span className="mr-1">✕</span> Remove
                  </button>
                )}
              </div>

              {/* Title */}
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
                {renderError(`followUps.${index}.title`)}
              </div>

              {/* Date & Time */}
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
                  {renderError(`followUps.${index}.dueDate`)}
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

              {/* Type & Priority */}
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

              {/* Notes */}
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

        <p className="mt-3 text-xs text-gray-500">
          Total Follow-ups: {formData.followUps.length}
        </p>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || loadingEmployees}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : initialData ? "Update Lead" : "Save Lead"}
        </button>
      </div>
    </form>
  );
}