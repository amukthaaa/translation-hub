import { HashRouter, Routes, Route } from "react-router-dom";
import { RequestsProvider } from "./context/RequestsContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewRequest from "./pages/NewRequest";
import RequestDetail from "./pages/RequestDetail";
import Backlog from "./pages/Backlog";

export default function App() {
  return (
    <RequestsProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewRequest />} />
            <Route path="/request/:id" element={<RequestDetail />} />
            <Route path="/backlog" element={<Backlog />} />
          </Route>
        </Routes>
      </HashRouter>
    </RequestsProvider>
  );
}
