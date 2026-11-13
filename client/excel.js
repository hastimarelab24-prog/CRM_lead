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