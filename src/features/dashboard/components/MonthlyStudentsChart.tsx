import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import {  Sparkles } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  monthlyStudentsByFilter,
  MonthlyStudentPoint,
} from '@/data/mockData';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: MonthlyStudentPoint;
  }>;
  label?: string;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border border-brand-border shadow-xl text-left pointer-events-none min-w-[150px] z-50">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-1 mb-1.5">
          <span className="text-[11px] font-bold text-text-primary">{data.month || label}</span>
          {data.isHighlighted && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-red bg-brand-light-red px-1.5 py-0.5 rounded">
              Current
            </span>
          )}
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-[#702B40]" />
              Total Students
            </span>
            <span className="font-extrabold text-text-primary">
              {data.students.toLocaleString()}
            </span>
          </div>
          {data.newAdmissions !== undefined && (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-text-secondary font-medium">
                <span className="w-2 h-2 rounded-full bg-[#D28B96]" />
                New Admissions
              </span>
              <span className="font-bold text-success">+{data.newAdmissions}</span>
            </div>
          )}
          {data.growth && (
            <div className="border-t border-brand-border/60 pt-1 mt-1 flex items-center justify-between gap-3 font-semibold text-[10px]">
              <span className="text-text-secondary uppercase tracking-wider">Growth</span>
              <span className="text-brand-red font-bold">{data.growth}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyStudentsChartComponent: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Last 6 Months');

  const filterOptions = [
    { label: 'Last 6 Months', value: 'Last 6 Months' },
    { label: 'This Year (2026)', value: 'This Year (2026)' },
    { label: 'Last Year (2025)', value: 'Last Year (2025)' },
    { label: 'By Program', value: 'By Program' },
  ];

  const currentData =
    monthlyStudentsByFilter[selectedFilter] || monthlyStudentsByFilter['Last 6 Months'];

  return (
    <div className="h-full bg-white rounded-[20px] p-5 border border-brand-border shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(87,0,31,0.06)] transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <h3 className="text-sm sm:text-[15px] font-bold text-text-primary tracking-tight truncate">
            Monthly Students
          </h3>
        </div>
        <Dropdown
          value={selectedFilter}
          options={filterOptions}
          onChange={setSelectedFilter}
          size="sm"
        />
      </div>

      {/* Main Metric with Animated Number & Growth */}
      <div className="flex items-center justify-end gap-2 mb-1.5">

        {/* Peak Indicator */}
        <span className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold text-text-secondary bg-brand-bg px-2 py-0.5 rounded-lg border border-brand-border/60">
          <Sparkles className="w-2.5 h-2.5 mr-1 text-brand-red" />
          Peak: <span className="font-bold text-text-primary ml-1">{currentData.peakMonth}</span>
        </span>
      </div>

      {/* Breakdown Pill: Active vs New Enrollments */}
      <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-brand-bg/50 rounded-xl border border-brand-border/40 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#702B40]" />
          <span className="text-[11px] font-medium text-text-secondary">Enrolled:</span>
          <span className="text-[11px] font-bold text-text-primary">
            {currentData.activeStudents.toLocaleString()}
          </span>
        </div>
        <div className="w-px h-3 bg-brand-border/60" />
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[11px] font-medium text-text-secondary">New Intakes:</span>
          <span className="text-[11px] font-bold text-success">
            +{currentData.newStudents}
          </span>
        </div>
        <div className="w-px h-3 bg-brand-border/60 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-text-muted font-medium">
          <span>Avg:</span>
          <span className="font-semibold text-text-secondary">
            {currentData.averageMonthly.toLocaleString()}/mo
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[112px] mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData.points}
            margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
          >
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(112, 43, 64, 0.04)' }} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
              dy={3}
            />
            <Bar
              dataKey="students"
              name="Total Students"
              radius={[5, 5, 0, 0]}
              maxBarSize={selectedFilter === 'This Year (2026)' ? 16 : 28}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {currentData.points.map((entry, index) => (
                <Cell
                  key={`student-bar-${index}`}
                  fill={entry.isHighlighted ? '#702B40' : '#D28B96'}
                  className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const MonthlyStudentsChart = React.memo(MonthlyStudentsChartComponent);
