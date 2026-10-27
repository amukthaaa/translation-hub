import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RequestsProvider } from "./context/RequestsContext";
import { UsersProvider } from "./context/UsersContext";
import { GlossaryProvider } from "./context/GlossaryContext";
import { ROLE_HOME } from "./config/roles";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import MyRequests from "./pages/MyRequests";
import NewRequest from "./pages/NewRequest";
import RequestDetail from "./pages/RequestDetail";
import ReviewQueue from "./pages/ReviewQueue";
import ReviewScreen from "./pages/ReviewScreen";
import MyJobs from "./pages/MyJobs";
import JobWorkspace from "./pages/JobWorkspace";
import Glossary from "./pages/Glossary";
import AdminDashboard from "./pages/AdminDashboard";
import AllRequests from "./pages/AllRequests";
import Metrics from "./pages/Metrics";
import UsersRoles from "./pages/UsersRoles";
import Backlog from "./pages/Backlog";

function RootRedirect() {
  const { role } = useAuth();
  return <Navigate to={role ? ROLE_HOME[role] : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <GlossaryProvider>
          <RequestsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<Layout />}>
                  <Route path="/my-requests" element={<MyRequests />} />
                  <Route path="/new-request" element={<NewRequest />} />
                  <Route path="/request/:id" element={<RequestDetail />} />
                  <Route path="/review-queue" element={<ReviewQueue />} />
                  <Route path="/review/:id/:lang" element={<ReviewScreen />} />
                  <Route path="/my-jobs" element={<MyJobs />} />
                  <Route path="/job/:id/:lang" element={<JobWorkspace />} />
                  <Route path="/glossary" element={<Glossary />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/all-requests" element={<AllRequests />} />
                  <Route path="/metrics" element={<Metrics />} />
                  <Route path="/users-roles" element={<UsersRoles />} />
                  <Route path="/backlog" element={<Backlog />} />
                </Route>
                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </BrowserRouter>
          </RequestsProvider>
        </GlossaryProvider>
      </UsersProvider>
    </AuthProvider>
  );
}
