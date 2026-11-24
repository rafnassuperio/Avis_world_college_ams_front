import React from "react";
import { useAnalytics } from "@/services/analytics";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { ReportStatsCards } from "./ReportStatsCards";
import { LocalInternationalBarChart } from "./LocalInternationalBarChart";
import { PaymentStatusPieChart } from "./PaymentStatusPieChart";

export const CollegeReportsTab: React.FC = () => {
  const { data, loading, error, reload } = useAnalytics();
  if (loading || error || !data) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;
  const reportOverviewStats = { studentEnrollment: { total: data.totals.students, growth: "—", local: data.totals.local, international: data.totals.international, period: "" },
    coursesOffered: { total: data.totals.courses, newCourses: 0, categoriesCount: data.totals.categories, period: "" },
    thisMonthIntake: { total: data.totals.newStudents, growth: "—", target: 0, capacityPercentage: 0, cohortName: "" } };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold tracking-tight text-text-primary sm:text-lg">College Reports</h2>
      </div>

      {/* 2. Three Cards: Student Enrollment, Courses Offered, This Month's Intake */}
      <div>
        <ReportStatsCards stats={reportOverviewStats} />
      </div>

      {/* 3. Two Charts: Local and International Student (Bar) + Payment Status Overview (Pie) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LocalInternationalBarChart />
        <PaymentStatusPieChart />
      </div>
    </div>
  );
};
