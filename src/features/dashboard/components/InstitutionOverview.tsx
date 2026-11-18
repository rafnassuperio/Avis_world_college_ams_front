import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { instituteSalesData } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      month: string;
      sales: number;
      target: number;
      growth: string;
    };
  }>;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAboveTarget = data.sales >= data.target;

    return (
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-brand-border shadow-[0_8px_24px_-4px_rgba(112,43,64,0.18)] text-left select-none pointer-events-none min-w-[155px] sm:min-w-[170px] z-50">
        {/* Month Header */}
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5 mb-2">
          <p className="text-[11px] font-bold text-text-primary tracking-wide">
            {data.month} 2026
          </p>
          <span className="inline-flex items-center text-[10px] font-bold text-success bg-success-light px-1.5 py-0.5 rounded-md leading-none">
            {data.growth}
          </span>
        </div>

        {/* Sales Metric */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-text-secondary font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-red inline-block" />
              Institute Sales:
            </span>
            <span className="text-xs font-extrabold text-brand-red">
              ₹ {data.sales.toFixed(1)}L
            </span>
          </div>

          {/* Sales Target */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-text-secondary font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-burgundy-primary/40 inline-block" />
              Sales Quota:
            </span>
            <span className="text-[11px] font-bold text-text-secondary">
              ₹ {data.target.toFixed(1)}L
            </span>
          </div>

          {/* Target Status Pill */}
          <div className="mt-1 pt-1 border-t border-brand-border/40 text-center">
            <span
              className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full inline-block ${isAboveTarget
                  ? 'bg-success-light text-success'
                  : 'bg-amber-50 text-amber-700'
                }`}
            >
              {isAboveTarget ? '✓ Target Surpassed' : '● Near Target'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const InstitutionOverviewComponent: React.FC = () => {
  const overviewFilter = useAppStore((state) => state.overviewFilter);
  const setOverviewFilter = useAppStore((state) => state.setOverviewFilter);
  const [dataFilter, setDataFilter] = useState<string>(overviewFilter);

  const filterOptions = [
    { label: 'This Year (2026)', value: 'This Year' },
    { label: 'Last Year (2025)', value: 'Last Year' },
    { label: 'All Time Trend', value: 'All Time' },
  ];

  const handleFilterChange = (val: string) => {
    setDataFilter(val);
    setOverviewFilter(val as 'This Year' | 'Last Year' | 'All Time');
  };

  // Scaled data based on filter selection
  const chartData = instituteSalesData.map((d) => {
    if (dataFilter === 'Last Year') {
      return {
        ...d,
        sales: Number((d.sales * 0.82).toFixed(1)),
        target: Number((d.target * 0.82).toFixed(1)),
      };
    }
    if (dataFilter === 'All Time') {
      return {
        ...d,
        sales: Number((d.sales * 1.15).toFixed(1)),
        target: Number((d.target * 1.12).toFixed(1)),
      };
    }
    return d;
  });

  const peakMonth = chartData.reduce(
    (max, curr) => (curr.sales > max.sales ? curr : max),
    chartData[0]
  );

  const peakSalesValue = peakMonth.sales;

  return (
    <div className="h-full bg-white rounded-[22px] p-4 sm:p-6 border border-brand-border shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(87,0,31,0.06)] transition-all duration-300 flex flex-col justify-between">
      {/* 1. Header: Title & Dropdown Filter */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-4 mb-2 sm:mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-brand-light-red flex items-center justify-center text-brand-red flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base md:text-[15px] font-bold text-text-primary tracking-tight truncate">
            Institute Sales Overview
          </h2>
        </div>

        {/* Timeframe Dropdown */}
        <div className="flex items-center gap-2 self-start xs:self-auto flex-shrink-0">
          <Dropdown
            value={dataFilter}
            options={filterOptions}
            onChange={handleFilterChange}
            buttonClassName="text-xs px-2.5 sm:px-3 py-1 sm:py-1.5"
          />
        </div>
      </div>

      {/* Quick Legend & Summary for Mobile and Desktop */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3 px-0.5">
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-red inline-block" />
            <span className="text-[11px] font-semibold text-text-primary">
              Sales: <span className="font-extrabold text-brand-red">₹ {peakSalesValue.toFixed(1)}L</span>
            </span>
          </div>
          <span className="text-text-muted text-[10px]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-[#702B40] inline-block" />
            <span className="text-[11px] font-medium text-text-secondary">Target Quota</span>
          </div>
        </div>
      </div>

      {/* 2. Main Content: Smooth Spline Area Chart */}
      <div className="max-w-[100%] h-[235px] sm:h-[255px] relative flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 38, right: 12, left: -0, bottom: 0 }}
          >
            <defs>
              {/* Primary Wine Gradient */}
              <linearGradient id="colorInstituteSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A64C61" stopOpacity={0.8} />
                <stop offset="45%" stopColor="#D28B96" stopOpacity={0.35} />
                <stop offset="90%" stopColor="#F1DDE0" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--brand-border)"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 600 }}
              dy={6}
              interval="preserveStartEnd"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(val) => (val === 0 ? '₹0' : `₹${val}L`)}
              width={38}
            />

            <Tooltip content={<CustomChartTooltip />} />

            {/* Target benchmark dashed curve */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#702B40"
              strokeDasharray="4 4"
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={true}
              animationDuration={1100}
            />

            {/* Main Area Fill for Sales */}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="var(--brand-red)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorInstituteSales)"
              isAnimationActive={true}
              animationDuration={1300}
              animationEasing="ease-out"
              dot={{
                r: 3,
                fill: 'var(--brand-red)',
                strokeWidth: 2,
                stroke: '#FFFFFF',
              }}
              activeDot={{
                r: 6,
                fill: 'var(--brand-red)',
                strokeWidth: 2.5,
                stroke: '#FFFFFF',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const InstitutionOverview = React.memo(InstitutionOverviewComponent);

// Also export as InstituteSalesChart for explicit semantic naming
export const InstituteSalesChart = InstitutionOverview;
