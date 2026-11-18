import React, { useState } from 'react';
import { Users, GraduationCap, Layers, IndianRupee, ArrowUpRight } from 'lucide-react';
import { statCardsData } from '@/data/mockData';
import { motion } from 'framer-motion';
import { smoothEase } from '@/components/animations/transitions';
import { StatCardFluidWave } from './StatCardFluidWave';

export const StatisticsCards: React.FC = () => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Users':
        return <Users className="w-5 h-5 text-brand-red" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-brand-red" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-brand-red" />;
      case 'IndianRupee':
        return <IndianRupee className="w-5 h-5 text-amber-600" />;
      default:
        return <Users className="w-5 h-5 text-brand-red" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {statCardsData.map((card, index) => {
        const waveColor = card.iconColor || "#A64C61";
        const isHovered = hoveredCardId === card.id;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: smoothEase }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onMouseEnter={() => setHoveredCardId(card.id)}
            onMouseLeave={() => setHoveredCardId(null)}
            className="group relative overflow-hidden bg-white rounded-[20px] p-4 border border-brand-border shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] hover:shadow-[0_12px_24px_-6px_rgba(87,0,31,0.08)] transition-all cursor-default"
          >
            <div className="relative z-10 flex items-center gap-3.5">
              {/* Icon Square */}
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.iconBgColor || 'var(--brand-light-red)' }}
              >
                {getIcon(card.iconName)}
              </div>

              {/* Stats and Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-[22px] font-bold text-text-primary tracking-tight leading-none">
                    {card.value}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-bold text-success bg-success-light px-1.5 py-0.5 rounded-md border border-success/30 leading-none">
                    <ArrowUpRight className="w-2.5 h-2.5 mr-0.5 stroke-[2.5]" />
                    {card.change}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p className="text-[12px] font-medium text-text-secondary mt-1 truncate">
                  {card.subtitle || card.title}
                </p>
              </div>
            </div>

            {/* Fluid decorative wave aligned to card corner (Framer Motion & GSAP) */}
            <StatCardFluidWave
              id={`stat-card-${card.id}`}
              waveColor={waveColor}
              index={index}
              isHovered={isHovered}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
