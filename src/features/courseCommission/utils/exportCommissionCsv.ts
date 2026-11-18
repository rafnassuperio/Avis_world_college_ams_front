import { CourseCommissionConfig } from "../types";

export const exportCommissionToCsv = (
  items: CourseCommissionConfig[],
  filename = "avis_college_course_commission_config.csv"
) => {
  if (!items || items.length === 0) return;

  const headers = [
    "No.",
    "Course Code",
    "Course Name",
    "Department",
    "Level",
    "Course Tuition Fee",
    "Commission Types Summary",
    "Agent Share",
    "Representative Share",
    "Status",
    "Last Updated",
  ];

  const escapeCsv = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = items.map((item, index) => {
    const summary = item.commissionTypes
      .map(
        (t) =>
          `${t.typeName} (Agent: ${t.agentShare.calcType === "Fixed ($)" ? "$" : ""}${t.agentShare.value}${t.agentShare.calcType === "Percent (%)" ? "%" : ""}, Rep: ${t.repShare.calcType === "Fixed ($)" ? "$" : ""}${t.repShare.value}${t.repShare.calcType === "Percent (%)" ? "%" : ""})`
      )
      .join(" | ");

    const agentSummary = item.commissionTypes
      .map(
        (t) =>
          `${t.typeName}: ${t.agentShare.calcType === "Fixed ($)" ? "$" : ""}${t.agentShare.value}${t.agentShare.calcType === "Percent (%)" ? "%" : ""}`
      )
      .join("; ");

    const repSummary = item.commissionTypes
      .map(
        (t) =>
          `${t.typeName}: ${t.repShare.calcType === "Fixed ($)" ? "$" : ""}${t.repShare.value}${t.repShare.calcType === "Percent (%)" ? "%" : ""}`
      )
      .join("; ");

    return [
      escapeCsv(index + 1),
      escapeCsv(item.code),
      escapeCsv(item.courseName),
      escapeCsv(item.department || "Academic"),
      escapeCsv(item.level || "Undergraduate"),
      escapeCsv(`${item.currency || "SGD"} ${(item.courseFee || 0).toFixed(2)}`),
      escapeCsv(summary),
      escapeCsv(agentSummary),
      escapeCsv(repSummary),
      escapeCsv(item.status || "Active"),
      escapeCsv(item.lastUpdated || "N/A"),
    ];
  });

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
