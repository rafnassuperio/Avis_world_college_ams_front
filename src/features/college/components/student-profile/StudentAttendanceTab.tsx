import React from "react";
import { CalendarCheck, CalendarX, TrendingUp, ShieldCheck } from "lucide-react";
import { CollegeStudent } from "../../types";

export interface StudentAttendanceTabProps {
  student: CollegeStudent;
}

export const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({ student }) => {
  const attendanceRate = student.attendanceCount || "92%";
  const leaveSummary = student.leaveCount || "3 Days";
  const performanceRate = student.performanceCount || "88.5%";
  const numericAttendance = typeof attendanceRate === "number" ? attendanceRate : parseFloat(String(attendanceRate).replace("%", "")) || 92;
  const isIcaCompliant = numericAttendance >= 90;

  return (
    <div className="space-y-4">
      {/* 3 Main Health Indicator Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Attendance Card */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Overall Attendance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-emerald-950">{attendanceRate}</span>
            <span className="text-xs font-medium text-emerald-700">Present (46/50 days)</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, numericAttendance)}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] text-text-muted">
            Minimum 90% attendance required for Singapore ICA Student Pass compliance.
          </p>
        </div>

        {/* Leave Record Card */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Leave Record</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <CalendarX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-amber-950">{leaveSummary}</span>
            <span className="text-xs font-medium text-amber-700">Total Absences</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: "60%" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
            <span>2 Approved Medical/Personal</span>
            <span className="font-semibold text-amber-700">1 Pending Review</span>
          </div>
        </div>

        {/* Academic Performance Card */}
        <div className="rounded-2xl border border-burgundy-primary/20 bg-gradient-to-br from-brand-light-red/25 via-white to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-burgundy-primary">Academic Standing</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-palette-midnight">{performanceRate}</span>
            <span className="text-xs font-medium text-brand-red">Grade A · GPA 3.84</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-light-red/50">
            <div
              className="h-full rounded-full bg-burgundy-primary transition-all duration-500"
              style={{ width: "88.5%" }}
            />
          </div>
          <p className="mt-3 text-[11px] text-text-muted">
            Course: {student.course} ({student.courseCode || "HDIT"})
          </p>
        </div>
      </div>

      {/* Regulatory & ICA Compliance Banner */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isIcaCompliant ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-text-primary">ICA Student Pass Attendance Threshold</h4>
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                isIcaCompliant ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>
                {isIcaCompliant ? "Fully Compliant" : "Action Required"}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              Under Singapore Immigration and Checkpoints Authority (ICA) guidelines, international student pass holders must maintain a minimum of 90% monthly attendance. {student.name} is currently at <span className="font-bold text-emerald-700">{attendanceRate}</span>, meeting all statutory attendance requirements for the current intake cohort ({student.intakeName || student.intake}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
