import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon, CreditCard } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { useAnalytics } from "@/services/analytics";
import { useApiCollection } from "@/hooks/useApiCollection";
import { intakes } from "@/services/ams";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { PaymentStatusDataPoint } from "../types";
import { cn } from "@/lib/utils";

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: PaymentStatusDataPoint;
  }>;
}

const CustomPieTooltip: React.FC<CustomPieTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="pointer-events-none relative z-50 min-w-[160px] select-none rounded-2xl border border-brand-border bg-white p-3 text-left shadow-xl">
        <div className="mb-1.5 flex items-center justify-between border-b border-brand-border/60 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-xs font-bold text-text-primary">{data.name}</span>
          </div>
          <span className="text-[10px] font-bold text-text-secondary">{data.percentage}%</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-text-secondary">Students:</span>
            <span className="font-bold text-text-primary">{data.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-text-secondary">Amount:</span>
            <span
              className="font-extrabold"
              style={{ color: data.color }}
            >
              {data.amount}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PaymentStatusPieChart: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All Intakes");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data: intakeList } = useApiCollection(intakes);
  const filterOptions = [{ label: "All Intakes", value: "All Intakes" }, ...intakeList.map(i => ({ label: i.name, value: i.name }))];

  const { data, loading, error, reload } = useAnalytics(selectedFilter === "All Intakes" ? undefined : selectedFilter);
  const count = data?.paymentStatus.reduce((sum, s) => sum + s.students, 0) || 0;
  const currentData = (data?.paymentStatus || []).map((r, index) => ({ id: r.name, name: r.name, students: r.students, percentage: count ? Number((r.students / count * 100).toFixed(1)) : 0,
    amount: data?.currency + " " + r.amount.toLocaleString(), color: ["#702B40", "#A64C61", "#D28B96"][index], badgeBg: "bg-brand-light-red text-burgundy-primary border-brand-border", badgeText: r.name }));

  const totalStudents = useMemo(() => {
    return currentData.reduce((acc, curr) => acc + curr.students, 0);
  }, [currentData]);

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

  return (
    <div className="flex h-full flex-col justify-between rounded-[22px] border border-brand-border bg-white p-4 shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(87,0,31,0.06)] sm:p-5">
      {/* Header */}
      <div className="relative z-20 mb-2 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-light-red text-brand-red">
            <PieIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="truncate text-sm font-bold tracking-tight text-text-primary sm:text-base">Payment Status Overview</h3>
            <p className="text-[11px] text-text-secondary">Breakdown of student fee settlements & dues</p>
          </div>
        </div>

        <Dropdown
          value={selectedFilter}
          options={filterOptions}
          onChange={setSelectedFilter}
          size="sm"
        />
      </div>

      {/* Chart and Center Metric */}
      <div className="relative my-auto flex items-center justify-center py-1">
        {/* Center Donut Label */}
        <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center text-center">
          <CreditCard className="mb-0.5 h-3.5 w-3.5 text-text-muted" />
          <span className="text-base font-extrabold tracking-tight text-text-primary sm:text-lg">{totalStudents.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-text-secondary">Students</span>
        </div>

        <div className="relative z-10 h-[185px] w-full max-w-[280px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Tooltip
                content={<CustomPieTooltip />}
                wrapperStyle={{ zIndex: 50, outline: "none" }}
              />
              <Pie
                data={currentData}
                dataKey="students"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={82}
                paddingAngle={3}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {currentData.map((entry, index) => (
                  <Cell
                    key={`pie-cell-${entry.id}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "center center",
                      filter: hoveredIndex === index ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : "none",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Structured Legend Grid */}
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-brand-border/60 pt-3">
        {currentData.map((item, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "flex cursor-default items-center justify-between rounded-xl border border-brand-border/50 bg-brand-bg/40 p-2 transition-all",
                isHovered && "shadow-2xs border-brand-red/40 bg-brand-bg",
              )}
            >
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-[11px] font-bold text-text-primary">{item.name}</span>
                </div>
                <div className="mt-0.5 text-[10px] text-text-secondary">
                  {item.students} students ({item.percentage}%)
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-extrabold text-text-primary">{item.amount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
