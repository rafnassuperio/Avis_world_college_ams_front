import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  pendingPaymentsByFilter,
} from '@/data/mockData';
import { PendingPaymentBreakdownPoint } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: PendingPaymentBreakdownPoint;
  }>;
  label?: string;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const tuitionVal = data.tuitionDisplay || `₹ ${data.tuition.toFixed(1)}L`;
    const appVal = data.applicationDisplay || `₹ ${data.application.toFixed(1)}L`;
    const totalVal = data.totalDisplay || `₹ ${(data.tuition + data.application).toFixed(1)}L`;

    return (
      <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border border-brand-border shadow-xl text-left pointer-events-none min-w-[155px] z-50">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-1 mb-1.5">
          <span className="text-[11px] font-bold text-text-primary">{data.period || label}</span>
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
              Tuition
            </span>
            <span className="font-bold text-text-primary">{tuitionVal}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D28B96]" />
              Application
            </span>
            <span className="font-bold text-text-primary">{appVal}</span>
          </div>
          <div className="border-t border-brand-border/60 pt-1 mt-1 flex items-center justify-between gap-3 font-extrabold">
            <span className="text-text-secondary text-[10px] uppercase tracking-wider">Total Due</span>
            <span className="text-brand-red text-xs">{totalVal}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PaymentsBreakdownComponent: React.FC = () => {
  const feeMonthFilter = useAppStore((state) => state.feeMonthFilter);
  const setFeeMonthFilter = useAppStore((state) => state.setFeeMonthFilter);
  const [selectedFilter, setSelectedFilter] = useState(
    pendingPaymentsByFilter[feeMonthFilter] ? feeMonthFilter : 'This Month'
  );
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  const [activeSeries, setActiveSeries] = useState<'all' | 'tuition' | 'application'>('all');

  const filterOptions = [
    { label: 'This Month', value: 'This Month' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'This Quarter', value: 'This Quarter' },
    { label: 'By Program', value: 'By Program' },
  ];

  const handleFilterChange = (val: string) => {
    setSelectedFilter(val);
    setFeeMonthFilter(val);
  };

  const currentData =
    pendingPaymentsByFilter[selectedFilter] || pendingPaymentsByFilter['This Month'];

  return (
    <div className="h-full bg-white rounded-[20px] p-5 border border-brand-border shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(87,0,31,0.06)] transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0 pr-2">
          <h3 className="text-sm sm:text-[15px] font-bold text-text-primary tracking-tight truncate">
            Pending Payments Breakdown
          </h3>
        </div>
        <Dropdown
          value={selectedFilter}
          options={filterOptions}
          onChange={handleFilterChange}
          size="sm"
        />
      </div>

      {/* Main Metric & Mode Switcher */}
      <div className="flex items-center justify-end gap-2 mb-1.5">
        {/* Grouped / Stacked View Mode Switcher */}
        <div className="flex items-center bg-brand-bg p-0.5 rounded-lg border border-brand-border text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setChartMode('grouped')}
            className={cn(
              'px-2 py-0.5 rounded transition-all select-none',
              chartMode === 'grouped'
                ? 'bg-white text-text-primary shadow-xs font-bold'
                : 'text-text-muted hover:text-text-primary'
            )}
            title="Grouped bar chart"
          >
            Grouped
          </button>
          <button
            type="button"
            onClick={() => setChartMode('stacked')}
            className={cn(
              'px-2 py-0.5 rounded transition-all select-none',
              chartMode === 'stacked'
                ? 'bg-white text-text-primary shadow-xs font-bold'
                : 'text-text-muted hover:text-text-primary'
            )}
            title="Stacked bar chart"
          >
            Stacked
          </button>
        </div>
      </div>

      {/* Interactive Legend with Fee Category Breakdown */}
      <div className="flex items-center justify-between text-xs py-1 px-1 bg-brand-bg/50 rounded-xl border border-brand-border/40 mb-1">
        {/* Tuition Fees */}
        <button
          type="button"
          onClick={() => setActiveSeries(activeSeries === 'tuition' ? 'all' : 'tuition')}
          className={cn(
            'flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all text-left group cursor-pointer',
            activeSeries === 'tuition'
              ? 'bg-white shadow-xs border border-brand-border'
              : activeSeries === 'application'
                ? 'opacity-40 hover:opacity-75'
                : 'hover:bg-white/80'
          )}
          title="Click to spotlight Tuition Fees"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#702B40] flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-text-secondary">Tuition:</span>
          <span className="text-[11px] font-bold text-text-primary">
            ₹ {currentData.tuitionTotal.toFixed(1)}L
          </span>
          <span className="text-[10px] text-text-muted font-medium hidden sm:inline">
            ({currentData.tuitionPercentage}%)
          </span>
        </button>

        {/* Application Fees */}
        <button
          type="button"
          onClick={() => setActiveSeries(activeSeries === 'application' ? 'all' : 'application')}
          className={cn(
            'flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all text-left group cursor-pointer',
            activeSeries === 'application'
              ? 'bg-white shadow-xs border border-brand-border'
              : activeSeries === 'tuition'
                ? 'opacity-40 hover:opacity-75'
                : 'hover:bg-white/80'
          )}
          title="Click to spotlight Application Fees"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#D28B96] flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-text-secondary">Application:</span>
          <span className="text-[11px] font-bold text-text-primary">
            ₹ {currentData.applicationTotal.toFixed(1)}L
          </span>
          <span className="text-[10px] text-text-muted font-medium hidden sm:inline">
            ({currentData.applicationPercentage}%)
          </span>
        </button>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[112px] mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData.points}
            margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
            barGap={chartMode === 'grouped' ? 2 : 0}
          >
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(112, 43, 64, 0.04)' }} />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
              dy={3}
            />
            <Bar
              dataKey="tuition"
              name="Tuition Fees"
              stackId={chartMode === 'stacked' ? 'pending' : undefined}
              fill={activeSeries === 'application' ? '#702B4035' : '#702B40'}
              radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              maxBarSize={chartMode === 'stacked' ? 20 : 12}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="application"
              name="Application Fees"
              stackId={chartMode === 'stacked' ? 'pending' : undefined}
              fill={activeSeries === 'tuition' ? '#D28B9635' : '#D28B96'}
              radius={[4, 4, 0, 0]}
              maxBarSize={chartMode === 'stacked' ? 20 : 12}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const PaymentsBreakdown = React.memo(PaymentsBreakdownComponent);
