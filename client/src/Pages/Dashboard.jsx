import React, { useContext, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WorkspaceContext } from "../context/WorkCountContext";

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const { totalLeads, totalTeam } = useContext(WorkspaceContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuGroups = [
    {
      title: "WORKSPACE",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "▦",
          roles: ["administrator", "admin", "manager", "employee"],
        },
        {
          name: "Leads",
          path: "/leads",
          icon: "♧",
          count: totalLeads ?? 0,
          roles: ["administrator", "admin", "manager", "employee"],
        },
        {
          name: "Follow-ups",
          path: "/follow-up",
          icon: "◷",
          roles: ["administrator", "admin", "manager", "employee"],
        },
        {
          name: "Team Members",
          path: "/team",
          icon: "♙",
          count: totalTeam ?? 0,
          roles: ["administrator", "admin", "manager", "employee"],
        },
      ],
    },
  ];

  // Trim spaces and normalize role string
  const role = String(user?.role || "employee").trim().toLowerCase();
  const displayName = user?.name || user?.username || user?.email || "User";

  const page = menuGroups
    .flatMap((group) => group.items)
    .find((item) => location.pathname === item.path);

  const pageTitle = page?.name || "Overview";

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-slate-900">
      {/* Mobile overlay */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Static sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px]
          flex-col border-r border-slate-800 bg-[#11162d]
          text-white transition-transform duration-200
          md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link
          to="/dashboard"
          onClick={() => setMenuOpen(false)}
          className="flex h-[90px] shrink-0 items-center gap-3
            border-b border-slate-800 px-6"
        >
          <span
            className="flex h-10 w-10 items-center justify-center
            rounded-xl bg-indigo-500 text-2xl font-bold"
          >
            ⌘
          </span>
          <span>
            <span className="block text-lg font-bold">LeadSphere</span>
            <span className="text-[10px] tracking-[2px] text-slate-400">
              CRM WORKSPACE
            </span>
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div
            className="mb-6 rounded-xl border border-slate-700
            bg-white/5 p-3"
          >
            <p className="font-semibold text-sm">LeadSphere Inc.</p>
            <p className="mt-1 text-xs text-slate-400">Free workspace</p>
          </div>

          {menuGroups.map((group) => {
            const items = group.items.filter((item) =>
              item.roles.includes(role)
            );

            if (!items.length) return null;

            return (
              <div key={group.title} className="mb-7">
                <p
                  className="mb-3 px-2 text-[10px] font-bold
                  tracking-[2px] text-slate-500"
                >
                  {group.title}
                </p>

                <nav className="space-y-1">
                  {items.map((item) => {
                    const active = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between rounded-xl
                          px-3 py-3 text-sm transition ${
                            active
                              ? "bg-indigo-500 text-white shadow-lg"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-center text-lg">
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </div>
                        
                        {item.count !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center
              justify-center rounded-full bg-indigo-400 font-bold"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="text-xs capitalize text-slate-400">{role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left
              text-sm text-red-300 hover:bg-red-500/10"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main page area */}
      <div className="min-h-screen min-w-0 md:ml-[260px]">
        <header
          className="sticky top-0 z-30 flex h-[66px]
          items-center justify-between border-b border-slate-200
          bg-white/95 px-4 backdrop-blur md:px-8"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle sidebar"
              className="rounded-lg border border-slate-200
                px-3 py-2 md:hidden"
            >
              ☰
            </button>

            <div>
              <p
                className="text-[10px] font-semibold tracking-[2px]
                text-slate-400"
              >
                WORKSPACE / {pageTitle.toUpperCase()}
              </p>
              <h1 className="text-lg font-bold md:text-xl">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              {displayName}
            </span>
            <div
              className="flex h-9 w-9 items-center justify-center
              rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}