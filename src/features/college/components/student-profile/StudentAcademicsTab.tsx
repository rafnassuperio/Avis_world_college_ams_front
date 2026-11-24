import React from "react";
import { GraduationCap, Calendar, Clock } from "lucide-react";
import { CollegeStudent } from "../../types";
import { StudentInfoCard, InfoFieldItem } from "./StudentInfoCard";

export interface StudentAcademicsTabProps {
  student: CollegeStudent;
  searchQuery?: string;
}

export const StudentAcademicsTab: React.FC<StudentAcademicsTabProps> = ({ student, searchQuery }) => {
  const academicFields: InfoFieldItem[] = [
    {
      label: "College",
      value: student.college || "—",
      badgeText: "Private Education Institution",
      badgeVariant: "brand",
    },
    {
      label: "Intake",
      value: student.intake || "—",
    },
    {
      label: "Intake Name",
      value: student.intakeName || "—",
      isMono: true,
      isCopyable: true,
    },
    {
      label: "Course",
      value: student.course || "—",
      badgeText: student.courseCode || "—",
      badgeVariant: "brand",
      colSpan: 2,
    },
    {
      label: "Class",
      value: student.class || "—",
    },
    {
      label: "Highest Academic Qualification",
      value: student.highestQualification || "—",
      colSpan: 2,
    },
    {
      label: "Study Mode",
      value: student.studyMode || "—",
    },
    {
      label: "PE Course Title",
      value: student.peCourseTitle || "—",
      colSpan: 2,
    },
    {
      label: "Course Delivery Mode",
      value: student.courseDeliveryMode || "—",
    },
    {
      label: "Course Commencement Date",
      value: student.commencementDate || "—",
      isMono: true,
      icon: Calendar,
    },
    {
      label: "Course Completion Date",
      value: student.completionDate || "—",
      isMono: true,
      icon: Calendar,
    },
    {
      label: "Application Date",
      value: student.applicationDate || "—",
      isMono: true,
    },
    {
      label: "Student Status",
      value: student.studentStatus || student.status || "—",
      badgeText: student.status || "—",
      badgeVariant: "emerald",
      colSpan: 2,
    },
  ];

  const displayedFields = React.useMemo(() => {
    if (!searchQuery?.trim()) return academicFields;
    const q = searchQuery.toLowerCase().trim();
    return academicFields.filter((f) => {
      const labelMatches = f.label.toLowerCase().includes(q);
      const valMatches = typeof f.value === "string" ? f.value.toLowerCase().includes(q) : false;
      const rawMatches = f.rawValue ? f.rawValue.toLowerCase().includes(q) : false;
      const badgeMatches = f.badgeText ? f.badgeText.toLowerCase().includes(q) : false;
      return labelMatches || valMatches || rawMatches || badgeMatches;
    });
  }, [academicFields, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Primary Academic Card */}
      <StudentInfoCard
        title="Academic Information"
        subtitle="Current enrollment, intake cohort, qualification level & milestones"
        icon={GraduationCap}
        iconColor="text-burgundy-primary"
        iconBgColor="bg-burgundy-primary/10"
        fields={displayedFields}
        columns={3}
      />

      {/* Academic Milestones Summary Banner */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Course Program Timeline</h3>
              <p className="text-[11px] text-text-muted">Commencement, duration & scheduled graduation</p>
            </div>
          </div>
          <span className="rounded-md border border-brand-border bg-brand-bg px-2.5 py-1 font-mono text-xs font-semibold text-text-secondary">
            Cohort {student.intakeName || student.intake}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-brand-border/60 bg-brand-bg/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Application</div>
            <div className="mt-1 font-mono text-xs font-bold text-text-primary">{student.applicationDate || student.joinedDate || "—"}</div>
            <div className="mt-1 text-[10px] text-text-muted">Submitted to Admissions</div>
          </div>

          <div className="rounded-xl border border-brand-border/60 bg-brand-bg/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Enrolled</div>
            <div className="mt-1 font-mono text-xs font-bold text-text-primary">{student.enrolledAt ? student.enrolledAt.split(" at ")[0] : "August 3, 2026"}</div>
            <div className="mt-1 text-[10px] text-emerald-600 font-medium">Matriculated</div>
          </div>

          <div className="rounded-xl border border-brand-border/60 bg-brand-bg/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Commencement</div>
            <div className="mt-1 font-mono text-xs font-bold text-text-primary">{student.commencementDate || "—"}</div>
            <div className="mt-1 text-[10px] text-text-muted">Classes Started</div>
          </div>

          <div className="rounded-xl border border-brand-border/60 bg-brand-bg/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Expected Completion</div>
            <div className="mt-1 font-mono text-xs font-bold text-burgundy-primary">{student.completionDate || "—"}</div>
            <div className="mt-1 text-[10px] text-text-muted">Final Assessment</div>
          </div>
        </div>
      </div>
    </div>
  );
};
