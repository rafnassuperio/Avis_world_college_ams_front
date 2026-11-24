import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Check, Clock, AlertCircle, Calendar, Download, Building2, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { smoothEase, incomingCardVariants, incomingCarouselVariants } from "@/components/animations/transitions";
import { useAnalytics } from "@/services/analytics";
import { useNavigate } from "react-router-dom";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { PendingPaymentCard } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const PaymentsPendingComponent: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAnalytics();
  const pendingPaymentCardsData = data?.pending || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<PendingPaymentCard | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -360 : 360;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getStatusBadge = (status: PendingPaymentCard["status"], subtext: string) => {
    switch (status) {
      case "Ready":
        return {
          pillClass: "bg-[#D1FAE5]/70 text-[#065F46] border border-[#A7F3D0]",
          dotClass: "text-[#059669]",
          icon: <Check className="h-3 w-3 stroke-[2.5]" />,
          label: "Ready",
          subtext: subtext || "Ready to serve",
        };
      case "In Progress":
        return {
          pillClass: "bg-[#FEF3C7]/80 text-[#92400E] border border-[#FDE68A]",
          dotClass: "text-[#D97706]",
          icon: <Clock className="h-3 w-3 stroke-[2.5]" />,
          label: "In Progress",
          subtext: subtext || "Cooking Now",
        };
      case "Due Soon":
        return {
          pillClass: "bg-brand-light-red/90 text-burgundy-primary border border-brand-red/20",
          dotClass: "text-brand-red",
          icon: <Calendar className="h-3 w-3 stroke-[2.5]" />,
          label: "Due Soon",
          subtext: subtext || "Due in 2 days",
        };
      case "Overdue":
        return {
          pillClass: "bg-red-50 text-red-700 border border-red-200",
          dotClass: "text-red-600",
          icon: <AlertCircle className="h-3 w-3 stroke-[2.5]" />,
          label: "Overdue",
          subtext: subtext || "Payment Overdue",
        };
      case "Pending":
      default:
        return {
          pillClass: "bg-[#FFF4E5] text-[#B45309] border border-[#FDE68A]/60",
          dotClass: "text-[#D97706]",
          icon: <Clock className="h-3 w-3 stroke-[2.5]" />,
          label: "Pending",
          subtext: subtext || "Awaiting Payment",
        };
    }
  };

  const handleQuickPaySuccess = (_studentName: string) => {
    if (selectedCard) navigate(`/payment/settle/${selectedCard.id}`);
    setPaymentSuccess(null);
  };
  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

  return (
    <div className="mb-2 mt-6 bg-transparent">
      {/* Header Section */}
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-text-primary sm:text-[17px]">Payments Pending</h2>
            <span className="rounded-full border border-brand-red/15 bg-brand-light-red px-2 py-0 text-[11px] font-extrabold text-burgundy-primary">
              {pendingPaymentCardsData.length} Records
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary">Based on total fees & outstanding breakdown</p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => scroll("left")}
            className="cursor-pointer rounded-full border border-brand-border bg-white p-1.5 text-text-secondary shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors hover:bg-brand-bg hover:text-text-primary"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => scroll("right")}
            className="cursor-pointer rounded-full border border-brand-border bg-white p-1.5 text-text-secondary shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors hover:bg-brand-bg hover:text-text-primary"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal Carousel of Payment Cards */}
      <motion.div
        ref={scrollContainerRef}
        variants={shouldReduceMotion ? undefined : incomingCarouselVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08, margin: "0px 0px -20px 0px" }}
        className="no-scrollbar flex select-none items-stretch gap-4 overflow-x-auto scroll-smooth pb-3 pt-1"
      >
        {pendingPaymentCardsData.map((card) => {
          const statusConfig = getStatusBadge(card.status, card.statusSubtext);

          return (
            <motion.div
              key={card.id}
              variants={shouldReduceMotion ? undefined : incomingCardVariants}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -6,
                      scale: 1.012,
                      transition: { duration: 0.22, ease: smoothEase },
                    }
              }
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              className="group flex w-[310px] flex-shrink-0 cursor-default flex-col justify-between rounded-[22px] border border-brand-border bg-white p-5 shadow-[0_3px_12px_-2px_rgba(66,27,41,0.04)] transition-shadow duration-300 hover:border-brand-border/90 hover:shadow-[0_12px_28px_-4px_rgba(66,27,41,0.09)] sm:w-[330px] md:w-[345px]"
            >
              {/* Card Top: Avatar, Name, and Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Dark wine / Burgundy rounded avatar badge with student code */}
                    <div className="shadow-xs flex h-8 w-8 shrink-0 items-center justify-center rounded-[14px] bg-[#421B29] text-[12px] font-extrabold tracking-wide text-white">
                      {card.studentCode}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-bold tracking-tight text-text-primary transition-colors group-hover:text-brand-red">
                        {card.studentName}
                      </h3>
                    </div>
                  </div>

                  {/* Status Pill Badge & Subtext */}
                  <div className="flex shrink-0 flex-col items-end">
                    <span
                      className={`shadow-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusConfig.pillClass}`}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="mt-1 flex items-center justify-between border-b border-brand-border/60 pb-2.5 pt-3.5 text-xs font-medium text-text-secondary/75">
                  <span>{card.date}</span>
                </div>

                {/* Proper Table View */}
                <div className="pb-1 pt-2.5">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/70 text-[11px] font-semibold text-text-muted">
                        <th className="pb-2 text-left font-semibold">Items</th>
                        <th className="w-16 pb-2 text-center font-semibold">Qty</th>
                        <th className="pb-2 text-right font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40 text-xs">
                      <tr className="transition-colors hover:bg-brand-bg/50">
                        <td className="py-2.5 text-left font-medium text-text-primary">Total Fees</td>
                        <td className="py-2.5 text-center text-xs font-bold text-burgundy-primary">{card.currency}</td>
                        <td className="py-2.5 text-right font-bold text-text-primary">{card.totalFees.toLocaleString()}</td>
                      </tr>
                      <tr className="transition-colors hover:bg-brand-bg/50">
                        <td className="py-2.5 text-left font-medium text-text-primary">Application Fees</td>
                        <td className="py-2.5 text-center text-xs font-bold text-burgundy-primary">{card.currency}</td>
                        <td className="py-2.5 text-right font-bold text-text-primary">{card.applicationFees.toLocaleString()}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-brand-border">
                        <td className="pb-1 pt-3 text-left text-sm font-bold text-text-primary">Outstanding</td>
                        <td className="pb-1 pt-3 text-center text-xs font-bold text-burgundy-primary">{card.currency}</td>
                        <td className="pb-1 pt-3 text-right text-base font-extrabold tracking-tight text-brand-accent sm:text-[17px]">
                          {card.outstanding.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="mt-3.5 pt-2">
                <div className="flex items-center gap-2">
                  {/* View Details Button */}
                  <motion.button
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    type="button"
                    onClick={() => setSelectedCard(card)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-red to-burgundy-primary px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors duration-200 hover:from-burgundy-primary hover:to-burgundy-dark hover:shadow"
                  >
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span>View Details</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Pending Payment Details"
        subtitle={selectedCard ? `${selectedCard.studentName} • ${selectedCard.orderRef}` : ""}
        maxWidth="md"
      >
        {selectedCard && (
          <div className="space-y-4 text-xs">
            {/* Student Overview Card */}
            <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#421B29] text-base font-bold text-white">
                  {selectedCard.studentCode}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{selectedCard.studentName}</h4>
                  <p className="mt-0.5 text-xs text-text-secondary">{selectedCard.program}</p>
                </div>
              </div>
              <span className="rounded-full border border-brand-red/20 bg-brand-light-red px-2.5 py-1 text-[11px] font-bold text-burgundy-primary">
                {selectedCard.status}
              </span>
            </div>

            {/* Date & Invoice Info */}
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-brand-border bg-white p-3">
              <div>
                <span className="block text-[11px] text-text-muted">Receipt / Order Ref</span>
                <span className="mt-0.5 block text-xs font-bold text-text-primary">{selectedCard.orderRef}</span>
              </div>
              <div>
                <span className="block text-[11px] text-text-muted">Billing Date & Time</span>
                <span className="mt-0.5 block text-xs font-semibold text-text-primary">
                  {selectedCard.date} • {selectedCard.time}
                </span>
              </div>
            </div>

            {/* Itemized Fee Statement Table */}
            <div className="rounded-xl border border-brand-border bg-white p-3.5">
              <span className="mb-2.5 block text-[11px] font-bold uppercase tracking-wider text-text-secondary">Itemized Fee Statement</span>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/70 text-[11px] font-semibold text-text-muted">
                    <th className="pb-2 text-left font-semibold">Items</th>
                    <th className="w-16 pb-2 text-center font-semibold">Qty</th>
                    <th className="pb-2 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-xs">
                  <tr className="transition-colors hover:bg-brand-bg/50">
                    <td className="py-2.5 text-left font-medium text-text-primary">Total Fees</td>
                    <td className="py-2.5 text-center text-xs font-bold text-burgundy-primary">{selectedCard.currency}</td>
                    <td className="py-2.5 text-right font-bold text-text-primary">{selectedCard.totalFees.toLocaleString()}</td>
                  </tr>
                  <tr className="transition-colors hover:bg-brand-bg/50">
                    <td className="py-2.5 text-left font-medium text-text-primary">Application Fees</td>
                    <td className="py-2.5 text-center text-xs font-bold text-burgundy-primary">{selectedCard.currency}</td>
                    <td className="py-2.5 text-right font-bold text-text-primary">{selectedCard.applicationFees.toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-brand-border">
                    <td className="pb-0.5 pt-2.5 text-left text-sm font-bold text-text-primary">Outstanding</td>
                    <td className="pb-0.5 pt-2.5 text-center text-xs font-bold text-burgundy-primary">{selectedCard.currency}</td>
                    <td className="pb-0.5 pt-2.5 text-right text-base font-extrabold text-brand-accent">
                      {selectedCard.outstanding.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment Method Note */}
            <div className="flex items-center gap-2 rounded-xl border border-[#FFE8DC] bg-[#FFF9F6] p-3 text-text-secondary">
              <Building2 className="h-4 w-4 shrink-0 text-[#D97706]" />
              <span className="text-[11px]">
                Accepted via <strong>PayNow SGD</strong>, <strong>FAST Bank Transfer</strong>, or Campus Desk.
              </span>
            </div>

            {paymentSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{paymentSuccess}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCard(null)}
              >
                Close
              </Button>
              <Button
                variant="burgundy"
                size="sm"
                onClick={() => handleQuickPaySuccess(selectedCard.studentName)}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                Download Statement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const PaymentsPending = React.memo(PaymentsPendingComponent);
