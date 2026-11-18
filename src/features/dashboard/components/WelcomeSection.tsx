import React from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Layers, IndianRupee } from "lucide-react";
import { assets } from "@/assets/assets";
import Breadcrumb from "@/components/common/Breadcrumb";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { smoothEase } from "@/components/animations/transitions";
import { StatCardFluidWave } from "./StatCardFluidWave";

interface StatItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  glowColor: string;
  waveColor: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  badge: string;
  title: string;
}

const stats: StatItem[] = [
  {
    id: "students",
    icon: <Users className="h-5 w-5 text-brand-red" />,
    iconBg: "#F1DDE0",
    glowColor: "rgba(166, 76, 97, 0.14)",
    waveColor: "#A64C61",
    numericValue: 1248,
    badge: "+5.2%",
    title: "Total Students",
  },
  {
    id: "totalRepresentatives",
    icon: <GraduationCap className="h-5 w-5 text-burgundy-primary" />,
    iconBg: "rgba(112, 43, 64, 0.10)",
    glowColor: "rgba(112, 43, 64, 0.14)",
    waveColor: "#702B40",
    numericValue: 86,
    badge: "+2.1%",
    title: "Total Representatives",
  },
  {
    id: "totalAgents",
    icon: <Layers className="h-5 w-5 text-brand-red" />,
    iconBg: "rgba(210, 139, 150, 0.22)",
    glowColor: "rgba(210, 139, 150, 0.20)",
    waveColor: "#D28B96",
    numericValue: 14,
    badge: "+16.7%",
    title: "Total Agents",
  },
  {
    id: "agentApplications",
    icon: <IndianRupee className="h-5 w-5 text-burgundy-dark" />,
    iconBg: "rgba(66, 27, 41, 0.08)",
    glowColor: "rgba(66, 27, 41, 0.14)",
    waveColor: "#421B29",
    numericValue: 78,
    badge: "+18.2%",
    title: "Agent Applications",
  },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }
  return "Good Evening";
};

interface StatCardProps {
  item: StatItem;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ item, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.08 + index * 0.07,
        ease: smoothEase,
      }}
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.22, ease: "easeOut" },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-default overflow-hidden rounded-[20px] border border-brand-border/40 bg-white/95 p-3.5 shadow-[0_4px_18px_-2px_rgba(66,27,41,0.04),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-sm transition-all hover:border-brand-border hover:shadow-[0_14px_30px_-6px_rgba(112,43,64,0.12)] sm:rounded-[22px] sm:p-4"
    >
      <div className="relative z-10 flex items-center gap-3 sm:gap-3.5">
        {/* Icon Box with gentle ambient glow */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 18 }}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] transition-transform duration-200 sm:h-12 sm:w-12 sm:rounded-[16px]"
          style={{
            backgroundColor: item.iconBg,
            boxShadow: `0 4px 12px ${item.glowColor}`,
          }}
        >
          {item.icon}
        </motion.div>

        {/* Stat details */}
        <div className="min-w-0 flex-1">
          {/* Value and growth pill */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[20px] font-bold leading-none tracking-tight text-text-primary sm:text-[22px]">
              <AnimatedNumber
                value={item.numericValue}
                delay={120 + index * 70}
                duration={1100}
                formatter={(v) => {
                  const formatted = item.decimals !== undefined ? v.toFixed(item.decimals) : Math.round(v).toLocaleString();
                  return `${item.prefix || ""}${formatted}${item.suffix || ""}`;
                }}
              />
            </span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
              className="inline-flex items-center whitespace-nowrap rounded-full border border-success/30 bg-success-light px-1.5 py-0.5 text-[10.5px] font-semibold leading-none text-success sm:text-[11px]"
            >
              <span className="mr-0.5 text-[10px] font-bold">↑</span>
              {item.badge}
            </motion.span>
          </div>

          {/* Subtitle / Label */}
          <p className="mt-1 text-[11.5px] font-medium leading-tight text-text-secondary sm:text-[12px]">{item.title}</p>
        </div>
      </div>

      {/* Dual-layer fluid decorative wave aligned to card corner (Framer Motion & GSAP) */}
      <StatCardFluidWave
        id={item.id}
        waveColor={item.waveColor}
        index={index}
        isHovered={isHovered}
      />
    </motion.div>
  );
};

const WelcomeSectionComponent: React.FC = () => {
  const [greeting, setGreeting] = React.useState<string>(getGreeting);

  React.useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const breadcrumbParts = [{ name: "Dashboard" }];

  return (
    <div className="relative mb-5 overflow-hidden rounded-[26px] border border-brand-border bg-gradient-to-r from-brand-bg via-brand-bg/85 to-brand-bg shadow-[0_4px_24px_-4px_rgba(66,27,41,0.04)]">
      {/* Right side: Avis College Building with smooth feathered blend */}
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-0 w-full select-none overflow-hidden sm:w-[65%] md:w-[58%] lg:w-[52%] xl:w-[48%]">
        <div className="relative h-full w-full">
          {/* Feathered mask on left edge */}
          <div className="absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-brand-bg via-brand-bg/70 to-transparent sm:w-44" />
          <div className="absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-brand-bg/40 to-transparent" />

          {/* Building image with smooth subtle entrance reveal and optimized async decoding */}
          <motion.img
            src={assets.avisCollege}
            alt="Avis World College Campus"
            loading="eager"
            decoding="async"
            width={1774}
            height={887}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: smoothEase }}
            className="h-full w-full select-none object-cover object-right transition-transform duration-700 hover:scale-[1.02]"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.85) 38%, black 58%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.85) 38%, black 58%)",
            }}
          />
        </div>
      </div>

      {/* Main Content: Header & Statistics Cards */}
      <div className="relative z-10 flex flex-col justify-between p-5 sm:p-6 lg:p-7">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: smoothEase }}
          className="max-w-xl"
        >
          {/* Greeting */}
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-text-primary sm:text-[17px]">
            <span>{greeting}, Administrator</span>
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              className="inline-block origin-bottom-right cursor-default"
            >
              👋
            </motion.span>
          </p>

          {/* Breadcrumb Title */}
          <div className="mt-2">
            <Breadcrumb items={breadcrumbParts} />
          </div>
        </motion.div>

        {/* Bottom Row: 4 Statistics Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4 xl:gap-4">
          {stats.map((item, index) => (
            <StatCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const WelcomeSection = React.memo(WelcomeSectionComponent);
