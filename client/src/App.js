
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkCountContext from "./context/WorkCountContext"

import Dashboard from "./Pages/Dashboard";
import Leads from "./Pages/Leads";
import Team from "./Pages/Team";
import AssignLead from "./Pages/AssignLead";
import AuditLogs from "./Pages/AuditLogs";
import CreateUser from "./Pages/CreateUser";
import FollowUps from "./Pages/FollowUp";
import DashboardHome from "./Pages/DashboardHome";
import LeadActivity from "./Pages/LeadActivity";

function App() {
  return (
    <AuthProvider>
      <WorkCountContext>


      <Routes>
        {/* Public pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All authenticated pages share one layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Dashboard />}>
            <Route
              path="/dashboard"
              element={<DashboardHome />}
            />

            <Route path="/leads" element={<Leads />} />

            <Route
              path="/follow-up"
              element={<FollowUps/>}
            />

            <Route
              path="/leads/:leadId/activities"
              element={<LeadActivity />}
            />

            {/* Administrator-only pages */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["administrator"]}
                />
              }
            >
              <Route path="/team" element={<Team />} />

              <Route
                path="/team/create"
                element={<CreateUser />}
              />

              <Route
                path="/audit-logs"
                element={<AuditLogs />}
              />
            </Route>

            {/* Administrator and manager */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["administrator", "manager"]}
                />
              }
            >
              <Route
                path="/assign-lead"
                element={<AssignLead />}
              />
            </Route>
          </Route>
        </Route>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
            </WorkCountContext>
    </AuthProvider>
  );
}

export default App;
