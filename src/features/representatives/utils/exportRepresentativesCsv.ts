import { RepresentativeItem } from "../types";

export const exportRepresentativesToCsv = (
  reps: RepresentativeItem[],
  filename = "avis_college_total_representatives.csv",
) => {
  if (!reps || reps.length === 0) return;

  const headers = [
    "Representative ID",
    "Full Name",
    "Email ID",
    "Country",
    "Agent Count",
    "Phone",
    "Organization / Title",
    "Status",
    "Joined Date",
  ];

  const escapeCsv = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = reps.map((r) => [
    escapeCsv(r.repCode),
    escapeCsv(r.name),
    escapeCsv(r.email),
    escapeCsv(r.country),
    escapeCsv(r.agentCount),
    escapeCsv(r.phone),
    escapeCsv(r.organization || "Representative"),
    escapeCsv(r.status),
    escapeCsv(r.joinedDate),
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
