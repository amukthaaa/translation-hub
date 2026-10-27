import { useMemo } from "react";
import { useRequests } from "../context/RequestsContext";
import { useAuth } from "../context/AuthContext";
import RequestsTable from "../components/RequestsTable";

export default function MyRequests() {
  const { requests } = useRequests();
  const { persona } = useAuth();

  const mine = useMemo(() => requests.filter((r) => r.owner === persona.name), [requests, persona]);

  return (
    <RequestsTable
      requests={mine}
      title="My Requests"
      showOwnerColumn={false}
      showNewRequestButton
      showOnboardingNote
    />
  );
}
