import { useRequests } from "../context/RequestsContext";
import RequestsTable from "../components/RequestsTable";

export default function AllRequests() {
  const { requests } = useRequests();

  return <RequestsTable requests={requests} title="All Requests" showOwnerColumn />;
}
