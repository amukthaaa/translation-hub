import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequestsProvider } from "./context/RequestsContext";
import { UsersProvider } from "./context/UsersContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewRequest from "./pages/NewRequest";
import RequestDetail from "./pages/RequestDetail";
import Metrics from "./pages/Metrics";
import Admin from "./pages/Admin";
import Backlog from "./pages/Backlog";

export default function App() {
  return (
    <UsersProvider>
      <RequestsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-request" element={<NewRequest />} />
              <Route path="/request/:id" element={<RequestDetail />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/backlog" element={<Backlog />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RequestsProvider>
    </UsersProvider>
  );
}
