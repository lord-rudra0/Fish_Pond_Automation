import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const severityColors = {
  critical: "bg-red-600 text-white",
  warning: "bg-yellow-500 text-white",
  info: "bg-blue-500 text-white",
};

export default function AlertsHistory() {
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: () => apiRequest("GET", "/api/alerts"),
  });

  if (error) {
    toast({
      title: "Error loading alerts",
      description: error.message || "Failed to load alerts.",
      variant: "destructive",
    });
  }

  const filteredAlerts = alerts.filter(alert => {
    return (
      (!severityFilter || alert.severity === severityFilter) &&
      (!statusFilter || (statusFilter === "acknowledged" ? alert.acknowledged : !alert.acknowledged))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Alert Notification History</CardTitle>
          <div className="flex flex-wrap gap-4 mt-4">
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="unacknowledged">Unacknowledged</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading alerts...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Severity</Th>
                    <Th>Status</Th>
                    <Th>Message</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredAlerts.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} className="text-center text-gray-400 py-8">No alerts found.</Td>
                    </Tr>
                  ) : (
                    filteredAlerts.map(alert => (
                      <Tr key={alert.id}>
                        <Td>{new Date(alert.timestamp).toLocaleString()}</Td>
                        <Td>
                          <span className={`px-2 py-1 rounded ${severityColors[alert.severity] || "bg-gray-300"}`}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </span>
                        </Td>
                        <Td>
                          {alert.acknowledged ? (
                            <Badge variant="success">Acknowledged</Badge>
                          ) : (
                            <Badge variant="destructive">Unacknowledged</Badge>
                          )}
                        </Td>
                        <Td>{alert.message}</Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}