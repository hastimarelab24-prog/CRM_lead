// import React, { useContext, useState } from "react";
// import { Link, Outlet, useLocation } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { WorkspaceContext } from "../context/WorkCountContext";

// export default function MainLayout() {
//   const { user, logout } = useContext(AuthContext);
//   const { totalLeads, totalTeam } = useContext(WorkspaceContext);
//   const location = useLocation();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const menuGroups = [
//     {
//       title: "WORKSPACE",
//       items: [
//         {
//           name: "Dashboard",
//           path: "/dashboard",
//           icon: "▦",
//           roles: ["administrator", "admin", "manager", "employee"],
//         },
//         {
//           name: "Leads",
//           path: "/leads",
//           icon: "♧",
//           count: totalLeads ?? 0,
//           roles: ["administrator", "admin", "manager", "employee"],
//         },
//         {
//           name: "Follow-ups",
//           path: "/follow-up",
//           icon: "◷",
//           roles: ["administrator", "admin", "manager", "employee"],
//         },
//         {
//           name: "Team Members",
//           path: "/team",
//           icon: "♙",
//           count: totalTeam ?? 0,
//           roles: ["administrator", "admin", "manager", "employee"],
//         },
//       ],
//     },
//   ];

//   // Trim spaces and normalize role string
//   const role = String(user?.role || "employee").trim().toLowerCase();
//   const displayName = user?.name || user?.username || user?.email || "User";

//   const page = menuGroups
//     .flatMap((group) => group.items)
//     .find((item) => location.pathname === item.path);

//   const pageTitle = page?.name || "Overview";

//   return (
//     <div className="min-h-screen bg-[#f5f7fc] text-slate-900">
//       {/* Mobile overlay */}
//       {menuOpen && (
//         <button
//           type="button"
//           aria-label="Close navigation"
//           onClick={() => setMenuOpen(false)}
//           className="fixed inset-0 z-40 bg-black/50 md:hidden"
//         />
//       )}

//       {/* Static sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-50 flex w-[260px]
//           flex-col border-r border-slate-800 bg-[#11162d]
//           text-white transition-transform duration-200
//           md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <Link
//           to="/dashboard"
//           onClick={() => setMenuOpen(false)}
//           className="flex h-[90px] shrink-0 items-center gap-3
//             border-b border-slate-800 px-6"
//         >
//           <span
//             className="flex h-10 w-10 items-center justify-center
//             rounded-xl bg-indigo-500 text-2xl font-bold"
//           >
//             ⌘
//           </span>
//           <span>
//             <span className="block text-lg font-bold">LeadSphere</span>
//             <span className="text-[10px] tracking-[2px] text-slate-400">
//               CRM WORKSPACE
//             </span>
//           </span>
//         </Link>

//         <div className="flex-1 overflow-y-auto px-4 py-5">
//           <div
//             className="mb-6 rounded-xl border border-slate-700
//             bg-white/5 p-3"
//           >
//             <p className="font-semibold text-sm">LeadSphere Inc.</p>
//             <p className="mt-1 text-xs text-slate-400">Free workspace</p>
//           </div>

//           {menuGroups.map((group) => {
//             const items = group.items.filter((item) =>
//               item.roles.includes(role)
//             );

//             if (!items.length) return null;

//             return (
//               <div key={group.title} className="mb-7">
//                 <p
//                   className="mb-3 px-2 text-[10px] font-bold
//                   tracking-[2px] text-slate-500"
//                 >
//                   {group.title}
//                 </p>

//                 <nav className="space-y-1">
//                   {items.map((item) => {
//                     const active = location.pathname === item.path;

//                     return (
//                       <Link
//                         key={item.path}
//                         to={item.path}
//                         onClick={() => setMenuOpen(false)}
//                         className={`flex items-center justify-between rounded-xl
//                           px-3 py-3 text-sm transition ${
//                             active
//                               ? "bg-indigo-500 text-white shadow-lg"
//                               : "text-slate-300 hover:bg-white/10 hover:text-white"
//                           }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <span className="w-5 text-center text-lg">
//                             {item.icon}
//                           </span>
//                           <span>{item.name}</span>
//                         </div>
                        
//                         {item.count !== undefined && (
//                           <span
//                             className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
//                               active
//                                 ? "bg-white/20 text-white"
//                                 : "bg-slate-800 text-slate-300"
//                             }`}
//                           >
//                             {item.count}
//                           </span>
//                         )}
//                       </Link>
//                     );
//                   })}
//                 </nav>
//               </div>
//             );
//           })}
//         </div>

//         <div className="shrink-0 border-t border-slate-800 p-4">
//           <div className="mb-3 flex items-center gap-3">
//             <div
//               className="flex h-10 w-10 shrink-0 items-center
//               justify-center rounded-full bg-indigo-400 font-bold"
//             >
//               {displayName.charAt(0).toUpperCase()}
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-sm font-semibold">{displayName}</p>
//               <p className="text-xs capitalize text-slate-400">{role}</p>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={logout}
//             className="w-full rounded-lg px-3 py-2 text-left
//               text-sm text-red-300 hover:bg-red-500/10"
//           >
//             ↪ Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main page area */}
//       <div className="min-h-screen min-w-0 md:ml-[260px]">
//         <header
//           className="sticky top-0 z-30 flex h-[66px]
//           items-center justify-between border-b border-slate-200
//           bg-white/95 px-4 backdrop-blur md:px-8"
//         >
//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               onClick={() => setMenuOpen(!menuOpen)}
//               aria-label="Toggle sidebar"
//               className="rounded-lg border border-slate-200
//                 px-3 py-2 md:hidden"
//             >
//               ☰
//             </button>

//             <div>
//               <p
//                 className="text-[10px] font-semibold tracking-[2px]
//                 text-slate-400"
//               >
//                 WORKSPACE / {pageTitle.toUpperCase()}
//               </p>
//               <h1 className="text-lg font-bold md:text-xl">{pageTitle}</h1>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <span className="hidden text-sm text-slate-500 sm:block">
//               {displayName}
//             </span>
//             <div
//               className="flex h-9 w-9 items-center justify-center
//               rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
//             >
//               {displayName.charAt(0).toUpperCase()}
//             </div>
//           </div>
//         </header>

//         <main className="min-w-0 p-4 md:p-8">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }




import React, { useContext, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WorkspaceContext } from "../context/WorkCountContext";

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const { totalLeads, totalTeam } = useContext(WorkspaceContext);

  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // ==========================================
  // MENU
  // ==========================================
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

  // ==========================================
  // USER DETAILS
  // ==========================================
  const role = String(user?.role || "employee")
    .trim()
    .toLowerCase();

  const displayName =
    user?.name ||
    user?.username ||
    user?.email ||
    "User";

  const firstLetter = displayName.charAt(0).toUpperCase();

  // ==========================================
  // CURRENT PAGE
  // ==========================================
  const page = menuGroups
    .flatMap((group) => group.items)
    .find((item) => location.pathname === item.path);

  const pageTitle = page?.name || "Overview";

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-slate-900">
      
      {/* ==========================================
          MOBILE OVERLAY
      ========================================== */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-[100dvh] w-[270px]
          flex-col overflow-hidden
          border-r border-slate-800
          bg-[#11162d]
          text-white
          shadow-2xl
          transition-transform duration-300 ease-in-out

          ${menuOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
          lg:shadow-none
        `}
      >
        {/* LOGO */}
        <Link
          to="/dashboard"
          onClick={closeMenu}
          className="flex h-[75px] shrink-0 items-center gap-3 border-b border-slate-800 px-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-2xl font-bold shadow-lg">
            ⌘
          </div>

          <div className="min-w-0">
            <span className="block truncate text-lg font-bold">
              LeadSphere
            </span>

            <span className="block text-[10px] tracking-[2px] text-slate-400">
              CRM WORKSPACE
            </span>
          </div>
        </Link>

        {/* SIDEBAR CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          
          {/* WORKSPACE CARD */}
          <div className="mb-6 rounded-xl border border-slate-700 bg-white/5 p-3">
            <p className="text-sm font-semibold">
              LeadSphere Inc.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Free workspace
            </p>
          </div>

          {/* MENU */}
          {menuGroups.map((group) => {
            const items = group.items.filter((item) =>
              item.roles.includes(role)
            );

            if (!items.length) return null;

            return (
              <div key={group.title}>
                <p className="mb-3 px-2 text-[10px] font-bold tracking-[2px] text-slate-500">
                  {group.title}
                </p>

                <nav className="space-y-1">
                  {items.map((item) => {
                    const active =
                      location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeMenu}
                        className={`
                          flex items-center justify-between
                          rounded-xl px-3 py-3
                          text-sm font-medium
                          transition-all duration-200

                          ${
                            active
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex w-5 justify-center text-lg">
                            {item.icon}
                          </span>

                          <span>{item.name}</span>
                        </div>

                        {item.count !== undefined && (
                          <span
                            className={`
                              min-w-[24px] rounded-full
                              px-2 py-0.5 text-center text-xs font-semibold

                              ${
                                active
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-800 text-slate-300"
                              }
                            `}
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

        {/* USER SECTION */}
        <div className="shrink-0 border-t border-slate-800 bg-[#0d1226] p-4">
          
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white shadow">
              {firstLetter}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {displayName}
              </p>

              <p className="truncate text-xs capitalize text-slate-400">
                {role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="
              w-full rounded-xl px-3 py-2.5
              text-left text-xs font-semibold text-red-300
              transition hover:bg-red-500/10 hover:text-red-200
            "
          >
            ↪ Logout Session
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA
      ========================================== */}
      <div className="min-h-screen lg:pl-[270px]">

        {/* ==========================================
            HEADER
        ========================================== */}
        <header
          className="
            sticky top-0 z-30
            flex h-[65px] sm:h-[70px]
            items-center justify-between
            border-b border-slate-200
            bg-white/95
            px-3 sm:px-6 lg:px-8
            backdrop-blur-md
          "
        >
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl border border-slate-200
                text-slate-700
                transition hover:bg-slate-50
                lg:hidden
              "
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* PAGE TITLE */}
            <div className="min-w-0">
              <p className="hidden text-[10px] font-bold tracking-[2px] text-slate-400 sm:block">
                WORKSPACE / {pageTitle.toUpperCase()}
              </p>

              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            
            <span className="hidden max-w-[180px] truncate text-sm font-medium text-slate-600 sm:block">
              {displayName}
            </span>

            <div className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              bg-indigo-100
              text-sm font-bold text-indigo-700
            ">
              {firstLetter}
            </div>
          </div>
        </header>

        {/* ==========================================
            PAGE CONTENT
        ========================================== */}
        <main
          className="
            min-w-0
            p-3
            sm:p-5
            md:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
}