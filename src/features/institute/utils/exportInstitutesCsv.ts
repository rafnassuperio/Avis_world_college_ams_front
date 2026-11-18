import { InstituteItem } from "../types";

export function exportInstitutesToCsv(institutes: InstituteItem[], filename = "institutes_directory.csv"): void {
  const headers = [
    "#",
    "Institute Code",
    "Institute Name",
    "Email ID",
    "Contact No",
    "Country",
    "Address",
    "Google Location",
    "Status",
    "Category",
    "Website",
  ];

  const escapeField = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = institutes.map((inst, index) => [
    index + 1,
    escapeField(inst.instituteCode),
    escapeField(inst.name),
    escapeField(inst.email),
    escapeField(inst.contactNo),
    escapeField(inst.country),
    escapeField(inst.address),
    escapeField(inst.googleLocation),
    escapeField(inst.status),
    escapeField(inst.category || "Campus"),
    escapeField(inst.website || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
