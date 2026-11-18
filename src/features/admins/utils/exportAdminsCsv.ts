import { AdminRosterItem } from "../types";

export const exportAdminsToCsv = (admins: AdminRosterItem[], filename = "avis_college_total_admins.csv") => {
  if (!admins || admins.length === 0) return;

  const headers = [
    "Employee ID",
    "Full Name",
    "Role",
    "Department",
    "Email",
    "Phone",
    "Campus Location",
    "Access Level",
    "Status",
    "Last Active",
    "Joined Date",
    "2FA Enabled",
  ];

  const escapeCsv = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = admins.map((a) => [
    escapeCsv(a.employeeId),
    escapeCsv(a.name),
    escapeCsv(a.role),
    escapeCsv(a.department),
    escapeCsv(a.email),
    escapeCsv(a.phone),
    escapeCsv(a.location),
    escapeCsv(a.accessLevel),
    escapeCsv(a.status),
    escapeCsv(a.lastActive),
    escapeCsv(a.joinedDate),
    escapeCsv(a.twoFactorEnabled ? "Yes" : "No"),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

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
