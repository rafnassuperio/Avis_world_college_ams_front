import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ROUTES } from "@/app/routes";
import { toast } from "@/components/common/ToastMessage";
import { assets } from "@/assets/assets";
import { SmartCampusIllustration } from "./SmartCampusIllustration";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * LoginPage - Institutional Admin Authentication Page
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const login = useAuthStore((state) => state.login);

  // References for GSAP physics
  const pageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const quickTiltX = useRef<gsap.QuickToFunc | null>(null);
  const quickTiltY = useRef<gsap.QuickToFunc | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email Required", {
        description: "Please enter your administrative email address.",
      });
      return;
    }

    if (!password.trim()) {
      toast.error("Password Required", {
        description: "Please enter your administrative password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate session via AuthStore
      const res = await login({ email, password });
      if (!res.success) {
        toast.error("Authentication Failed", {
          description: res.error || "Invalid credentials. Please verify your administrative email and password.",
        });
        return;
      }

      toast.success("Welcome Back to Avis AMS", {
        description: "Authenticated successfully. Redirecting to your dashboard...",
      });

      // Navigate to destination route or root dashboard
      const redirectUrl = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTES.HOME;
      navigate(redirectUrl, { replace: true });
    } catch {
      toast.error("Authentication Failed", {
        description: "Invalid credentials or network issue. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // GSAP: Initialize High-Performance Interpolated 3D QuickTo & Ambient Orbs
  useEffect(() => {
    if (shouldReduceMotion) return;

    if (cardRef.current) {
      gsap.set(cardRef.current, {
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
        force3D: true,
      });

      // quickTo provides 120 FPS buttery-smooth cursor interpolation without tween allocation lag
      quickTiltX.current = gsap.quickTo(cardRef.current, "rotationX", {
        duration: 0.9,
        ease: "power3.out",
      });

      quickTiltY.current = gsap.quickTo(cardRef.current, "rotationY", {
        duration: 0.9,
        ease: "power3.out",
      });
    }

    let ctx: gsap.Context | undefined;
    if (pageRef.current) {
      ctx = gsap.context(() => {
        // Orb 1: Upper left drifting ambient light
        gsap.to(".login-ambient-orb-1", {
          x: 50,
          y: -35,
          scale: 1.18,
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true,
        });

        // Orb 2: Lower right counter-drifting ambient light
        gsap.to(".login-ambient-orb-2", {
          x: -45,
          y: 40,
          scale: 0.88,
          duration: 12,
          delay: 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true,
        });
      }, pageRef);
    }

    return () => {
      ctx?.revert();
    };
  }, [shouldReduceMotion]);

  // GSAP: Ultra-Smooth Mousemove Tilt (Disabled on mobile/touch screens for stability)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current || !quickTiltX.current || !quickTiltY.current) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Gentle 3D tilt max +/- 2.2 degrees for a refined, non-distracting feel
    const maxTilt = 2.2;
    const targetX = (mouseY / (rect.height / 2)) * -maxTilt;
    const targetY = (mouseX / (rect.width / 2)) * maxTilt;

    quickTiltX.current(targetX);
    quickTiltY.current(targetY);
  };

  const handleMouseLeave = () => {
    if (shouldReduceMotion || !quickTiltX.current || !quickTiltY.current) return;
    quickTiltX.current(0);
    quickTiltY.current(0);
  };

  // Prevent selecting or copying page content
  const handleCopy = (e: React.ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  // Framer Motion Animation Variants (Smooth Apple-Grade Curves)
  const cardEntranceVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.97,
      y: shouldReduceMotion ? 0 : 26,
      filter: shouldReduceMotion ? "none" : "blur(8px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 32,
        stiffness: 220,
        mass: 0.9,
        // Linear/easeOut curve for filter to prevent spring oscillation below 0 (blur cannot be negative)
        filter: { duration: 0.5, ease: "easeOut" },
      },
    },
  };

  const leftBannerVariants: Variants = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -20,
      filter: shouldReduceMotion ? "none" : "blur(4px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.75,
        delay: 0.12,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const formStaggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.25,
      },
    },
  };

  const formItemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
      filter: shouldReduceMotion ? "none" : "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div
      ref={pageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onCopy={handleCopy}
      className="relative flex min-h-screen w-full select-none items-center justify-center overflow-y-auto overflow-x-hidden bg-[#F5F2F4] p-2.5 font-sans sm:p-5 md:p-8"
    >
      {/* GSAP Ambient Background Lighting Orbs */}
      <div className="login-ambient-orb-1 pointer-events-none fixed -left-36 -top-36 h-72 w-72 rounded-full bg-brand-red/15 blur-[60px] sm:h-96 sm:w-96 sm:blur-[100px]" />
      <div className="login-ambient-orb-2 pointer-events-none fixed -bottom-36 -right-36 h-72 w-72 rounded-full bg-burgundy-primary/15 blur-[60px] sm:h-96 sm:w-96 sm:blur-[100px]" />

      {/* Main Floating Outer Card with Framer Motion Entrance & GSAP 3D Tilt */}
      <motion.div
        ref={cardRef}
        variants={cardEntranceVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 my-auto w-full max-w-[940px] rounded-[24px] border border-brand-border/60 bg-white p-3 shadow-[0_20px_60px_-15px_rgba(66,27,41,0.08)] will-change-transform sm:rounded-[36px] sm:p-4 md:rounded-[40px] md:p-6"
      >
        <div className="grid grid-cols-1 items-stretch gap-3 sm:gap-5 md:grid-cols-2 md:gap-6">
          {/* ============================================================
              LEFT COLUMN: Branded Showcase Card with Vector Illustration
              ============================================================ */}
          <motion.div
            variants={leftBannerVariants}
            className="relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-[#702B40] via-[#5A2234] to-[#421B29] p-4 text-white shadow-inner sm:min-h-[400px] sm:rounded-[28px] sm:p-6 md:min-h-[550px] md:rounded-[32px] md:p-8 lg:p-9"
          >
            {/* Ambient Radial Sheen Highlights */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-red/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-1/3 h-72 w-72 rounded-full bg-[#A64C61]/25 blur-3xl" />

            {/* Top Institutional Crest Badge */}
            <div className="relative z-10 mb-4 flex w-full flex-wrap items-center justify-between gap-2 sm:mb-6 sm:gap-3">
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.025 }}
                transition={{ type: "spring", stiffness: 380, damping: 25 }}
                className="inline-flex cursor-default items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur-md transition-colors hover:bg-white/15 sm:gap-2.5 sm:px-3 sm:py-1.5"
              >
                <img
                  src={assets.avisLogo}
                  alt="Avis Crest"
                  className="drop-shadow-xs h-4 w-4 shrink-0 object-contain sm:h-5 sm:w-5"
                  style={{ width: "18px", height: "18px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
                <span className="whitespace-nowrap font-serif text-[10px] font-bold uppercase tracking-wider text-white sm:text-[11px]">
                  Avis World College
                </span>
              </motion.div>
              <span className="shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md sm:px-2.5 sm:py-1 sm:text-[10px]">
                AMS Portal
              </span>
            </div>

            {/* Top Typography Section */}
            <div className="relative z-10">
              <h1 className="text-xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-2xl md:text-[30px] lg:text-[34px]">
                Simplify
                <br />
                management with
                <br />
                <span className="relative mt-0.5 inline-block">
                  our dashboard.
                  {/* Framer Motion SVG Path Length Smooth Stroke Tracing */}
                  <svg
                    className="absolute -bottom-2 left-0 h-2.5 w-full overflow-visible text-[#F1DDE0] sm:-bottom-2.5 sm:h-3.5"
                    viewBox="0 0 170 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      d="M 2 6 Q 85 14 168 4"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: 1.3, delay: 0.5, ease: [0.25, 1, 0.5, 1] },
                        opacity: { duration: 0.35, delay: 0.5 },
                      }}
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-2.5 max-w-[275px] text-[11px] font-normal leading-relaxed text-white/85 sm:mt-4 sm:text-xs md:mt-5 md:text-[13px]">
                Simplify your college management with our user-friendly admin dashboard.
              </p>
            </div>

            {/* 3D Isometric Smart Digital Campus Animation (GSAP Physics & Pulsing Highways) */}
            <div className="relative z-10 mt-3 flex w-full items-end justify-center pt-2 sm:mt-auto sm:pt-4">
              <SmartCampusIllustration className="pointer-events-none h-auto max-h-[175px] w-full select-none drop-shadow-2xl sm:max-h-[220px] md:max-h-[285px] lg:max-h-[305px]" />
            </div>
          </motion.div>

          {/* ============================================================
              RIGHT COLUMN: Institutional Sign-in Form
              ============================================================ */}
          <div className="flex flex-col justify-center px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-11">
            <motion.div
              variants={formStaggerVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto w-full max-w-[360px]"
            >
              {/* Official Avis College Branding Header - Displayed on desktop */}
              <motion.div
                variants={formItemVariants}
                className="mb-4 hidden items-center justify-center gap-3 sm:mb-6 md:flex"
              >
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 380, damping: 25 }}
                  className="shadow-xs relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-border/80 bg-brand-bg/80 p-1.5 transition-colors hover:bg-brand-bg"
                >
                  <img
                    src={assets.avisLogo}
                    alt="Avis World College Emblem"
                    className="drop-shadow-xs h-9 w-9 object-contain"
                    style={{ width: "36px", height: "36px" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/avis-emblem.png";
                    }}
                  />
                </motion.div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-[17px] font-bold uppercase leading-tight tracking-wider text-burgundy-sidebar">Avis World</span>
                  <span className="font-serif text-[11px] font-semibold uppercase tracking-widest text-brand-red">College</span>
                </div>
              </motion.div>

              {/* Welcome Heading & Subtitle */}
              <motion.div
                variants={formItemVariants}
                className="mb-4 text-center sm:mb-6"
              >
                <h2 className="text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl md:text-[28px]">Welcome Back</h2>
                <p className="mt-1 text-xs font-medium text-text-muted sm:text-[13px]">Please login to your account</p>
              </motion.div>

              {/* Login Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-3 sm:space-y-3.5"
              >
                {/* Email Address Input with Icon */}
                <motion.div variants={formItemVariants}>
                  <label
                    htmlFor="login-email"
                    className="sr-only"
                  >
                    Email address
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/70 transition-colors group-focus-within:text-brand-red sm:left-4">
                      <Mail className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                      className="w-full select-text rounded-xl border border-transparent bg-[#F5F6F9] py-3 pl-10 pr-4 text-base font-medium text-text-primary transition-all duration-300 placeholder:text-text-muted/70 hover:bg-[#F0F2F5] focus:border-brand-red/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-red/10 disabled:opacity-60 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:text-sm"
                    />
                  </div>
                </motion.div>

                {/* Password Input with Lock Icon & Visibility Toggle */}
                <motion.div variants={formItemVariants}>
                  <label
                    htmlFor="login-password"
                    className="sr-only"
                  >
                    Password
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/70 transition-colors group-focus-within:text-brand-red sm:left-4">
                      <Lock className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      className="w-full select-text rounded-xl border border-transparent bg-[#F5F6F9] py-3 pl-10 pr-11 text-base font-medium text-text-primary transition-all duration-300 placeholder:text-text-muted/70 hover:bg-[#F0F2F5] focus:border-brand-red/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-red/10 disabled:opacity-60 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg p-1 text-text-muted transition-colors hover:text-text-primary focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Primary Login Button with Motion Physics & Sheen (min-h-[46px] for touch targets) */}
                <motion.div variants={formItemVariants}>
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.015, filter: "brightness(1.04)" }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 420, damping: 25 }}
                    type="submit"
                    disabled={isLoading}
                    className="relative mt-2 flex min-h-[46px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-red via-[#8E344D] to-burgundy-primary py-3 text-sm font-bold text-white shadow-lg shadow-burgundy/20 transition-all duration-300 hover:shadow-xl hover:shadow-burgundy/30 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-3 sm:rounded-2xl sm:py-3.5"
                  >
                    {/* Subtle Sheen Reflection Sweep */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out hover:translate-x-full" />

                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <span>Login</span>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
