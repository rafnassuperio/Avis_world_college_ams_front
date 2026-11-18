import { AgentItem } from "../types";

export const exportAgentsToCsv = (agents: AgentItem[], filename = "avis_college_total_agents.csv") => {
  if (!agents || agents.length === 0) return;

  const headers = [
    "Agent Code",
    "Full Name",
    "Email",
    "Phone",
    "Type",
    "Representative",
    "Country",
    "Status",
    "Joined Date",
  ];

  const escapeCsv = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = agents.map((a) => [
    escapeCsv(a.agentCode),
    escapeCsv(a.name),
    escapeCsv(a.email),
    escapeCsv(a.phone),
    escapeCsv(a.type),
    escapeCsv(a.representative),
    escapeCsv(a.country),
    escapeCsv(a.status),
    escapeCsv(a.joinedDate),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
