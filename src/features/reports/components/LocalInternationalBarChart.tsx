import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Users2, Globe2, BarChart2 } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { localInternationalDataByFilter } from "../data/reportsData";
import { LocalInternationalDataPoint } from "../types";
import { cn } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: LocalInternationalDataPoint;
  }>;
  label?: string;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="z-50 min-w-[170px] select-none rounded-2xl border border-brand-border bg-white/95 p-3 text-left shadow-xl backdrop-blur-md pointer-events-none">
        <div className="mb-2 flex items-center justify-between border-b border-brand-border/60 pb-1.5">
          <span className="text-xs font-bold text-text-primary">{label || data.period}</span>
          <span className="rounded-md bg-brand-light-red px-1.5 py-0.5 text-[10px] font-extrabold text-brand-red">
            {data.total} Total
          </span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 font-medium text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-[#702B40]" />
              Local:
            </span>
            <span className="font-extrabold text-[#702B40]">
              {data.local} <span className="text-[10px] text-text-muted">({data.localPercentage}%)</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 font-medium text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D28B96]" />
              International:
            </span>
            <span className="font-extrabold text-[#A64C61]">
              {data.international} <span className="text-[10px] text-text-muted">({data.internationalPercentage}%)</span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const LocalInternationalBarChart: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("Last 6 Months");
  const [activeSeries, setActiveSeries] = useState<"all" | "local" | "international">("all");

  const filterOptions = [
    { label: "Last 6 Months", value: "Last 6 Months" },
    { label: "This Year (2026)", value: "This Year (2026)" },
    { label: "By Cohort", value: "By Cohort" },
  ];

  const currentData = useMemo(() => {
    return localInternationalDataByFilter[selectedFilter] || localInternationalDataByFilter["Last 6 Months"];
  }, [selectedFilter]);

  const totals = useMemo(() => {
    const totalLocal = currentData.reduce((acc, curr) => acc + curr.local, 0);
    const totalIntl = currentData.reduce((acc, curr) => acc + curr.international, 0);
    const totalAll = totalLocal + totalIntl;
    const localPct = totalAll > 0 ? Math.round((totalLocal / totalAll) * 100) : 0;
    const intlPct = totalAll > 0 ? 100 - localPct : 0;
    return { totalLocal, totalIntl, totalAll, localPct, intlPct };
  }, [currentData]);

  return (
    <div className="flex h-full flex-col justify-between rounded-[22px] border border-brand-border bg-white p-4 shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(87,0,31,0.06)] sm:p-5">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-light-red text-brand-red">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="truncate text-sm font-bold tracking-tight text-text-primary sm:text-base">
              Local and International Student
            </h3>
            <p className="text-[11px] text-text-secondary">
              Comparative cohort distribution by residency
            </p>
          </div>
        </div>

        <Dropdown
          value={selectedFilter}
          options={filterOptions}
          onChange={setSelectedFilter}
          size="sm"
        />
      </div>

      {/* Interactive Legend & Quick Metrics */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-border/60 bg-brand-bg/50 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          {/* Local Pill */}
          <button
            type="button"
            onClick={() => setActiveSeries(activeSeries === "local" ? "all" : "local")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-left transition-all",
              activeSeries === "local"
                ? "border border-brand-border bg-white shadow-2xs"
                : activeSeries === "international"
                  ? "opacity-40 hover:opacity-75"
                  : "hover:bg-white/80",
            )}
            title="Click to spotlight Local Students"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#702B40]" />
            <Users2 className="h-3 w-3 text-text-secondary" />
            <span className="text-[11px] font-medium text-text-secondary">Local:</span>
            <span className="text-[11px] font-extrabold text-[#702B40]">
              {totals.totalLocal} ({totals.localPct}%)
            </span>
          </button>

          {/* International Pill */}
          <button
            type="button"
            onClick={() => setActiveSeries(activeSeries === "international" ? "all" : "international")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-left transition-all",
              activeSeries === "international"
                ? "border border-brand-border bg-white shadow-2xs"
                : activeSeries === "local"
                  ? "opacity-40 hover:opacity-75"
                  : "hover:bg-white/80",
            )}
            title="Click to spotlight International Students"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D28B96]" />
            <Globe2 className="h-3 w-3 text-text-secondary" />
            <span className="text-[11px] font-medium text-text-secondary">International:</span>
            <span className="text-[11px] font-extrabold text-[#A64C61]">
              {totals.totalIntl} ({totals.intlPct}%)
            </span>
          </button>
        </div>

        {/* Aggregate Ratio */}
        <span className="hidden text-[11px] font-semibold text-text-secondary sm:inline">
          Ratio: <span className="font-bold text-text-primary">{totals.localPct} : {totals.intlPct}</span>
        </span>
      </div>

      {/* Bar Chart Container */}
      <div className="h-[240px] w-full pt-1 sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 11, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
              width={38}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(112, 43, 64, 0.04)" }} />

            {/* Local Students Bar */}
            <Bar
              dataKey="local"
              name="Local Students"
              fill={activeSeries === "international" ? "rgba(112, 43, 64, 0.2)" : "#702B40"}
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
              isAnimationActive={true}
              animationDuration={850}
              animationEasing="ease-out"
            />

            {/* International Students Bar */}
            <Bar
              dataKey="international"
              name="International Students"
              fill={activeSeries === "local" ? "rgba(210, 139, 150, 0.2)" : "#D28B96"}
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
              isAnimationActive={true}
              animationDuration={950}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
