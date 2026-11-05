import React, { useEffect } from "react";

//  lead from open and close
export default function LeadModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center
   overflow-y-auto bg-slate-950/60 p-2 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="mt-2 flex max-h-[calc(100vh-16px]) w-full h-full max-w-[495px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:mt-4 sm:max-h-[cal(100vh-32px)]"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-300 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className=" ml-3 rounded-md p-1 text-xl leading-none text-slate-600 transition hover:bg-white hover:text-red-600"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
