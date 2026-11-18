import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import {
  CheckCircle2,
  Download,
  Send,
  Search,
  UserPlus,
  GraduationCap,
  UserCheck,
  CreditCard,
  BarChart3,
  Megaphone,
  CalendarRange,
  Settings,
  ArrowRight,
  FileText,
  IndianRupee,
  BookOpen,
  ShieldCheck,
  Users,
  RotateCcw,
  Clock,
  ExternalLink,
  ChevronRight,
  FilterX,
  Plus,
} from "lucide-react";
import { toast } from "@/components/common/ToastMessage";
import { RecentActivity } from "@/types";
import { ActivityDetailModal } from "./ActivityDetailModal";

const QuickActionModalsComponent: React.FC = () => {
  const navigate = useNavigate();
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const addActivity = useAppStore((state) => state.addActivity);
  const removeActivity = useAppStore((state) => state.removeActivity);
  const resetActivities = useAppStore((state) => state.resetActivities);
  const activities = useAppStore((state) => state.activities);
  const quickActions = useAppStore((state) => state.quickActions);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionSearch, setActionSearch] = useState("");
  const [actionCategory, setActionCategory] = useState("all");

  // Activity log states
  const [activitySearch, setActivitySearch] = useState("");
  const [activityCategory, setActivityCategory] = useState("all");
  const [activitySort, setActivitySort] = useState<"newest" | "oldest">("newest");
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<RecentActivity | null>(null);
  const [isManualActivityModalOpen, setIsManualActivityModalOpen] = useState(false);
  const [manualActivityForm, setManualActivityForm] = useState({
    title: "",
    detail: "",
    type: "admission" as RecentActivity["type"],
    performedBy: "System Administrator",
  });

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    program: "BSc Data Science & AI",
    phone: "",
  });

  const [programForm, setProgramForm] = useState({
    name: "",
    code: "",
    duration: "4 Years",
    seats: "60",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    department: "School of Computing",
    designation: "Assistant Professor",
  });

  const [paymentForm, setPaymentForm] = useState({
    student: "John Mathew (2026-DS-012)",
    amount: "45,000",
    mode: "UPI / NetBanking",
  });

  const [noticeForm, setNoticeForm] = useState({
    title: "",
    target: "All Students & Faculty",
    priority: "Normal",
    body: "",
  });

  const handleActionComplete = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
      closeModal();
    }, 1400);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name) return;
    addActivity({
      id: `act-${Date.now()}`,
      type: "admission",
      title: "New admission application",
      detail: studentForm.name,
      timeAgo: "Just now",
      timestamp: new Date().toISOString(),
      iconName: "UserPlus",
      badge: "Admissions",
      performedBy: "Admissions Desk",
      path: "/college",
      targetTab: "students",
      status: "completed",
      metadata: {
        "Student Name": studentForm.name,
        "Academic Program": studentForm.program,
        Email: studentForm.email,
        "Contact Phone": studentForm.phone || "N/A",
      },
    });
    handleActionComplete(`Student ${studentForm.name} enrolled successfully!`);
    setStudentForm({ name: "", email: "", program: "BSc Data Science & AI", phone: "" });
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.name) return;
    addActivity({
      id: `act-${Date.now()}`,
      type: "program",
      title: "Program created",
      detail: programForm.name,
      timeAgo: "Just now",
      timestamp: new Date().toISOString(),
      iconName: "BookOpen",
      badge: "Academic",
      performedBy: "Academic Senate",
      path: "/college",
      targetTab: "courses",
      status: "completed",
      metadata: {
        "Program Code": programForm.code,
        Duration: programForm.duration,
        "Seats Quota": programForm.seats,
      },
    });
    handleActionComplete(`Program ${programForm.name} created!`);
    setProgramForm({ name: "", code: "", duration: "4 Years", seats: "60" });
  };

  const handleAssignStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name) return;
    addActivity({
      id: `act-${Date.now()}`,
      type: "staff",
      title: "Staff added",
      detail: `${staffForm.name} (${staffForm.designation})`,
      timeAgo: "Just now",
      timestamp: new Date().toISOString(),
      iconName: "UserCheck",
      badge: "Faculty",
      performedBy: "HR / Academic Registrar",
      path: "/admins",
      status: "completed",
      metadata: {
        Department: staffForm.department,
        Designation: staffForm.designation,
      },
    });
    handleActionComplete(`Staff ${staffForm.name} assigned!`);
    setStaffForm({ name: "", department: "School of Computing", designation: "Assistant Professor" });
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity({
      id: `act-${Date.now()}`,
      type: "fee",
      title: "Fee payment received",
      detail: `₹${paymentForm.amount}`,
      timeAgo: "Just now",
      timestamp: new Date().toISOString(),
      iconName: "IndianRupee",
      badge: "Finance",
      performedBy: "Accounts Section",
      path: "/payment",
      status: "completed",
      metadata: {
        "Student Reference": paymentForm.student,
        "Amount Recorded": `₹${paymentForm.amount}`,
        "Payment Mode": paymentForm.mode,
      },
    });
    handleActionComplete(`Fee payment of ₹${paymentForm.amount} recorded!`);
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity({
      id: `act-${Date.now()}`,
      type: "system",
      title: "Campus circular broadcasted",
      detail: noticeForm.title || "Official Circular",
      timeAgo: "Just now",
      timestamp: new Date().toISOString(),
      iconName: "Megaphone",
      badge: "Notice",
      performedBy: "Provost / Admin Desk",
      status: "completed",
      metadata: {
        Audience: noticeForm.target,
        "Priority Level": noticeForm.priority,
      },
    });
    handleActionComplete("Institutional notice broadcasted to campus network!");
  };

  // Filtered & sorted activities for View All modal
  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        const matchesCategory = activityCategory === "all" || act.type === activityCategory;
        const query = activitySearch.toLowerCase().trim();
        const matchesSearch =
          !query ||
          act.title.toLowerCase().includes(query) ||
          act.detail.toLowerCase().includes(query) ||
          (act.performedBy && act.performedBy.toLowerCase().includes(query)) ||
          act.id.toLowerCase().includes(query) ||
          (act.badge && act.badge.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return activitySort === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [activities, activityCategory, activitySearch, activitySort]);

  const handleExportActivities = () => {
    const headers = ["Event ID", "Type", "Title", "Detail", "Time", "Actor", "Status"];
    const rows = filteredActivities.map((act) => [
      `"${act.id}"`,
      `"${act.type}"`,
      `"${act.title.replace(/"/g, '""')}"`,
      `"${act.detail.replace(/"/g, '""')}"`,
      `"${act.timeAgo}"`,
      `"${(act.performedBy || "System").replace(/"/g, '""')}"`,
      `"${act.status || "completed"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `avis_institutional_activities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Activities Exported", {
      description: `${filteredActivities.length} institutional activity records downloaded as CSV.`,
    });
  };

  const handleAddManualActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualActivityForm.title || !manualActivityForm.detail) return;
    const newAct: RecentActivity = {
      id: `act-${Date.now()}`,
      type: manualActivityForm.type,
      title: manualActivityForm.title,
      detail: manualActivityForm.detail,
      timeAgo: "Just now",
      timestamp: new Date().toISOString(),
      iconName:
        manualActivityForm.type === "fee"
          ? "IndianRupee"
          : manualActivityForm.type === "staff"
            ? "UserCheck"
            : manualActivityForm.type === "program"
              ? "BookOpen"
              : manualActivityForm.type === "system"
                ? "ShieldCheck"
                : "UserPlus",
      badge: manualActivityForm.type.toUpperCase(),
      performedBy: manualActivityForm.performedBy || "System Administrator",
      status: "completed",
    };
    addActivity(newAct);
    setIsManualActivityModalOpen(false);
    setManualActivityForm({
      title: "",
      detail: "",
      type: "admission",
      performedBy: "System Administrator",
    });
    toast.success("Activity Logged", {
      description: "New manual institutional event recorded.",
    });
  };

  const handleNavigateActivity = (act: RecentActivity) => {
    if (act.path) {
      if (act.targetTab) {
        try {
          sessionStorage.setItem("studentsTableActiveTab", act.targetTab);
          sessionStorage.setItem("collegeActiveTab", act.targetTab);
        } catch {
          // ignore
        }
      }
      closeModal();
      navigate(act.path);
    } else {
      setSelectedActivityDetail(act);
    }
  };

  const getActivityItemIcon = (act: RecentActivity) => {
    switch (act.iconName) {
      case "UserPlus":
        return <UserPlus className="h-3.5 w-3.5 text-brand-red" />;
      case "IndianRupee":
        return <IndianRupee className="h-3.5 w-3.5 text-brand-red" />;
      case "CreditCard":
        return <CreditCard className="h-3.5 w-3.5 text-brand-red" />;
      case "UserCheck":
        return <UserCheck className="h-3.5 w-3.5 text-brand-red" />;
      case "BookOpen":
        return <BookOpen className="h-3.5 w-3.5 text-brand-red" />;
      case "GraduationCap":
        return <GraduationCap className="h-3.5 w-3.5 text-brand-red" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />;
      case "Users":
        return <Users className="h-3.5 w-3.5 text-brand-red" />;
      case "FileText":
        return <FileText className="h-3.5 w-3.5 text-brand-red" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-brand-red" />;
    }
  };

  const getActivityTypeBadge = (type: RecentActivity["type"]) => {
    switch (type) {
      case "admission":
        return "bg-brand-light-red text-brand-red border-brand-border";
      case "fee":
        return "bg-brand-light-red/90 text-burgundy-primary border-brand-border";
      case "staff":
        return "bg-brand-light-red text-brand-red border-brand-border";
      case "program":
        return "bg-brand-light-red/80 text-burgundy-primary border-brand-border";
      case "system":
        return "bg-brand-light-red/70 text-burgundy-dark border-brand-border";
      case "partner":
        return "bg-palette-5/20 text-brand-red border-brand-border";
      case "report":
        return "bg-brand-light-red text-brand-red border-brand-border";
      default:
        return "bg-brand-bg text-text-secondary border-brand-border";
    }
  };

  if (!activeModal) return null;

  return (
    <>
      {/* 1. Add Student Modal */}
      <Modal
        isOpen={activeModal === "add-student"}
        onClose={closeModal}
        title="Add New Student"
        subtitle="Enroll a new student candidate into the institutional registry"
      >
        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 animate-bounce text-success" />
            <p className="text-sm font-bold text-text-primary">{successMessage}</p>
          </div>
        ) : (
          <form
            onSubmit={handleAddStudent}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="mb-1 block font-semibold text-text-primary">Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="student@avisworld.edu"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-semibold text-text-primary">Academic Program</label>
              <select
                value={studentForm.program}
                onChange={(e) => setStudentForm({ ...studentForm, program: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
              >
                <option>BSc Data Science & AI</option>
                <option>BBA Global Business Management</option>
                <option>BSc Cybersecurity & Networks</option>
                <option>B.Des Interactive Media & Design</option>
              </select>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-brand-border pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Enroll Student
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 2. Create Program Modal */}
      <Modal
        isOpen={activeModal === "create-program"}
        onClose={closeModal}
        title="Create Academic Program"
        subtitle="Establish an undergraduate, postgraduate, or certificate curriculum"
      >
        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 text-success" />
            <p className="text-sm font-bold text-text-primary">{successMessage}</p>
          </div>
        ) : (
          <form
            onSubmit={handleCreateProgram}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="mb-1 block font-semibold text-text-primary">Program Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Master of Business Administration"
                value={programForm.name}
                onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Program Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. MBA-EXEC"
                  value={programForm.code}
                  onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                  className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Approved Seats</label>
                <input
                  type="number"
                  placeholder="60"
                  value={programForm.seats}
                  onChange={(e) => setProgramForm({ ...programForm, seats: e.target.value })}
                  className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-brand-border pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Save Program
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 3. Assign Staff Modal */}
      <Modal
        isOpen={activeModal === "assign-staff"}
        onClose={closeModal}
        title="Assign Faculty & Staff"
        subtitle="Allocate professorial or administrative roles to college departments"
      >
        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 text-success" />
            <p className="text-sm font-bold text-text-primary">{successMessage}</p>
          </div>
        ) : (
          <form
            onSubmit={handleAssignStaff}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="mb-1 block font-semibold text-text-primary">Staff Member Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Dr. Ramesh Kumar"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Department</label>
                <select
                  value={staffForm.department}
                  onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                >
                  <option>School of Computing</option>
                  <option>School of Business</option>
                  <option>School of Design</option>
                  <option>Administrative Affairs</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Designation</label>
                <input
                  type="text"
                  placeholder="Assistant Professor"
                  value={staffForm.designation}
                  onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                  className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-brand-border pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Confirm Assignment
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 4. Collect Payment Modal */}
      <Modal
        isOpen={activeModal === "collect-payment"}
        onClose={closeModal}
        title="Collect Fee Payment"
        subtitle="Issue official receipt and record tuition transaction into college ledger"
      >
        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 text-success" />
            <p className="text-sm font-bold text-text-primary">{successMessage}</p>
          </div>
        ) : (
          <form
            onSubmit={handleCollectPayment}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="mb-1 block font-semibold text-text-primary">Select Student</label>
              <input
                type="text"
                value={paymentForm.student}
                onChange={(e) => setPaymentForm({ ...paymentForm, student: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Amount (₹)</label>
                <input
                  required
                  type="text"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 font-bold focus:border-brand-red focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Payment Mode</label>
                <select
                  value={paymentForm.mode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                >
                  <option>UPI / NetBanking</option>
                  <option>Demand Draft</option>
                  <option>Credit / Debit Card</option>
                  <option>NEFT / RTGS</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-brand-border pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Process Fee Receipt
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 5. Generate Report Modal */}
      <Modal
        isOpen={activeModal === "generate-report"}
        onClose={closeModal}
        title="Generate Institutional Reports"
        subtitle="Export official data digests, accreditation summaries & financial statements"
      >
        <div className="space-y-3 text-xs">
          {[
            { name: "Semester 1 Admissions & Enrollment Report", format: "PDF (2.4 MB)" },
            { name: "Quarterly Institutional Fee Ledger & Audit", format: "Excel / CSV (890 KB)" },
            { name: "Faculty Workload & Departmental Distribution", format: "PDF (1.2 MB)" },
            { name: "NAAC / AICTE Accreditation Compliance Pack", format: "ZIP Bundle (14.5 MB)" },
          ].map((rep, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-brand-border p-3 transition-colors hover:bg-brand-bg"
            >
              <div>
                <p className="font-bold text-text-primary">{rep.name}</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">{rep.format}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionComplete(`Downloaded ${rep.name}`)}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      {/* 6. Send Notice Modal */}
      <Modal
        isOpen={activeModal === "send-notice"}
        onClose={closeModal}
        title="Broadcast Campus Notice"
        subtitle="Send urgent announcements or official circulars to students and faculty"
      >
        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 text-success" />
            <p className="text-sm font-bold text-text-primary">{successMessage}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSendNotice}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="mb-1 block font-semibold text-text-primary">Notice Subject</label>
              <input
                required
                type="text"
                placeholder="e.g. Schedule for Mid-Term Academic Evaluations"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Audience</label>
                <select
                  value={noticeForm.target}
                  onChange={(e) => setNoticeForm({ ...noticeForm, target: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                >
                  <option>All Students & Faculty</option>
                  <option>Undergraduate Students Only</option>
                  <option>Faculty & Staff Only</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-text-primary">Priority</label>
                <select
                  value={noticeForm.priority}
                  onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
                >
                  <option>Normal Circular</option>
                  <option>High Priority Alert</option>
                  <option>Urgent Campus Emergency</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block font-semibold text-text-primary">Notice Body</label>
              <textarea
                rows={3}
                placeholder="Type circular contents here..."
                value={noticeForm.body}
                onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 border-t border-brand-border pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                <Send className="mr-1 h-3.5 w-3.5" />
                Broadcast Notice
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 7. Manage Intake Modal */}
      <Modal
        isOpen={activeModal === "manage-intake"}
        onClose={closeModal}
        title="Manage Admissions Intake"
        subtitle="Live status and seat capacity for active admission windows"
      >
        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-brand-border bg-brand-bg p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-text-primary">Autumn 2026 Batch</span>
                <p className="mt-0.5 text-[11px] text-text-secondary">Application Deadline: 30 Nov 2026</p>
              </div>
              <span className="rounded-full border border-success/30 bg-success-light px-2 py-0.5 text-[10px] font-bold text-success">
                Open for Applications
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-text-secondary">Target: 400 Seats</span>
              <span className="font-bold text-brand-red">324 Applied (81%)</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand-border/50">
              <div
                className="h-full rounded-full bg-brand-red"
                style={{ width: "81%" }}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleActionComplete("Intake configurations updated!")}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>

      {/* 8. Settings Modal */}
      <Modal
        isOpen={activeModal === "settings"}
        onClose={closeModal}
        title="System Administration & Preferences"
        subtitle="Manage institution credentials, security tokens & AMS options"
      >
        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-bg p-3">
            <img
              src="/assets/images/avatar-vishnu.png"
              alt="Vishnu"
              className="h-12 w-12 rounded-full ring-2 ring-white"
            />
            <div>
              <p className="text-sm font-bold text-text-primary">Vishnu Krishnakumar</p>
              <p className="text-[11px] text-text-secondary">Lead System Administrator • Avis World College</p>
              <span className="mt-1 inline-block rounded bg-burgundy-primary px-2 py-0.5 text-[9px] font-bold text-white">Super Admin Role</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-brand-border p-2.5 hover:bg-gray-50">
              <span className="font-semibold text-text-primary">Two-Factor Authentication (2FA)</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-brand-red"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-brand-border p-2.5 hover:bg-gray-50">
              <span className="font-semibold text-text-primary">Automated Nightly Database Sync</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-brand-red"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-brand-border p-2.5 hover:bg-gray-50">
              <span className="font-semibold text-text-primary">Email Alerts on Large Payments (&gt; ₹1L)</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-brand-red"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-brand-border pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={closeModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleActionComplete("Preferences saved")}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* 9. View All Activities Modal */}
      <Modal
        isOpen={activeModal === "view-all-activities"}
        onClose={closeModal}
        title="All Recent Institutional Activities"
        subtitle="Complete audit trail of admissions, fee receipts, curriculum changes, and staff operations"
        maxWidth="2xl"
      >
        <div className="space-y-3.5 text-xs">
          {/* Top Search & Filter Toolbar */}
          <div className="flex flex-col items-stretch justify-between gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search events, student names, actors, or IDs..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg/40 py-2 pl-9 pr-3 text-xs transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:flex-nowrap sm:justify-end">
              {/* Sort Toggle */}
              <button
                type="button"
                onClick={() => setActivitySort((prev) => (prev === "newest" ? "oldest" : "newest"))}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
                title="Toggle chronological sort order"
              >
                <Clock className="h-3 w-3 text-brand-red" />
                <span>{activitySort === "newest" ? "Newest First" : "Oldest First"}</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportActivities}
                className="flex cursor-pointer items-center gap-1 rounded-lg bg-burgundy-primary px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-burgundy-dark"
                title="Export active records to CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "All Events" },
              { id: "admission", label: "Admissions" },
              { id: "fee", label: "Fees & Finance" },
              { id: "program", label: "Academic" },
              { id: "staff", label: "Faculty & Staff" },
              { id: "system", label: "System Ops" },
              { id: "partner", label: "Partners" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActivityCategory(cat.id)}
                className={`cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  activityCategory === cat.id
                    ? "shadow-xs bg-burgundy-primary text-white"
                    : "border border-brand-border/60 bg-brand-bg text-text-secondary hover:text-text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Activities List */}
          <div className="max-h-[380px] space-y-1.5 divide-y divide-brand-border/40 overflow-y-auto pr-1">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FilterX className="mb-2 h-10 w-10 text-text-muted" />
                <p className="text-xs font-bold text-text-primary">No activities match your query</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">Try adjusting your search criteria or switching categories.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActivitySearch("");
                    setActivityCategory("all");
                  }}
                  className="mt-3 text-xs font-bold text-brand-red hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivityDetail(act)}
                  className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-transparent px-2.5 pb-2 pt-2 transition-all hover:border-brand-border/60 hover:bg-brand-bg/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shadow-xs flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-border/80 bg-white transition-transform group-hover:scale-105">
                      {getActivityItemIcon(act)}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-0.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`py-0.2 rounded border px-1.5 text-[9.5px] font-bold uppercase tracking-wider ${getActivityTypeBadge(act.type)}`}
                        >
                          {act.badge || act.type}
                        </span>
                        <p className="truncate font-semibold text-text-primary">
                          <span className="transition-colors group-hover:text-brand-red">{act.title}</span> –{" "}
                          <span className="font-bold">{act.detail}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <span>Event ID: {act.id}</span>
                        <span>•</span>
                        <span>Actor: {act.performedBy || "System Administrator"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-[11px] font-medium text-text-secondary">{act.timeAgo}</span>
                    {act.path ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateActivity(act);
                        }}
                        className="rounded-md p-1 text-text-muted transition-colors hover:bg-brand-light-red hover:text-brand-red"
                        title="Go directly to record"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted transition-colors group-hover:text-brand-red" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Footer Toolbar */}
          <div className="flex items-center justify-between border-t border-brand-border pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-secondary">
                Total Events: <strong className="text-text-primary">{filteredActivities.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  resetActivities();
                  toast.success("Activities Reset", {
                    description: "Default institutional activity feed restored.",
                  });
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-text-muted transition-colors hover:text-text-primary"
                title="Reset feed to default"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Feed</span>
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={closeModal}
            >
              Close Audit Trail
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Activity Creation Modal */}
      <Modal
        isOpen={isManualActivityModalOpen}
        onClose={() => setIsManualActivityModalOpen(false)}
        title="Log Institutional Event"
        subtitle="Manually append an operational memo, decision, or verified action"
        maxWidth="md"
      >
        <form
          onSubmit={handleAddManualActivity}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="mb-1 block font-semibold text-text-primary">Event Category</label>
            <select
              value={manualActivityForm.type}
              onChange={(e) =>
                setManualActivityForm({
                  ...manualActivityForm,
                  type: e.target.value as RecentActivity["type"],
                })
              }
              className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
            >
              <option value="admission">Admissions</option>
              <option value="fee">Finance & Fees</option>
              <option value="staff">Faculty & Staff</option>
              <option value="program">Academic Programs</option>
              <option value="system">System Operations</option>
              <option value="partner">Education Partners</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-text-primary">Event Summary</label>
            <input
              required
              type="text"
              placeholder="e.g. Scholarship awarded / Semester exam approved"
              value={manualActivityForm.title}
              onChange={(e) => setManualActivityForm({ ...manualActivityForm, title: e.target.value })}
              className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-text-primary">Entity Details / Subject</label>
            <input
              required
              type="text"
              placeholder="e.g. Rahul Sharma (2026-CS-041) or ₹25,000"
              value={manualActivityForm.detail}
              onChange={(e) => setManualActivityForm({ ...manualActivityForm, detail: e.target.value })}
              className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-text-primary">Authorized Actor</label>
            <input
              type="text"
              placeholder="e.g. Admissions Office / Registrar"
              value={manualActivityForm.performedBy}
              onChange={(e) => setManualActivityForm({ ...manualActivityForm, performedBy: e.target.value })}
              className="w-full rounded-xl border border-brand-border px-3.5 py-2.5 focus:border-brand-red focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 border-t border-brand-border pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsManualActivityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Append to Activity Feed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={Boolean(selectedActivityDetail)}
        onClose={() => setSelectedActivityDetail(null)}
        activity={selectedActivityDetail}
        onDismiss={(id) => {
          removeActivity(id);
          setSelectedActivityDetail(null);
        }}
      />

      {/* 10. View All Actions Modal */}
      <Modal
        isOpen={activeModal === "view-all-actions"}
        onClose={closeModal}
        title="Quick Action Directory"
        maxWidth="xl"
      >
        <div className="space-y-3.5">
          {/* Search & Category Filter */}
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search shortcuts or workflows..."
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg/40 py-2 pl-9 pr-3 text-xs transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>
            <div className="no-scrollbar flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
              {["all", "admissions", "academics", "finance", "admin"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActionCategory(cat)}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-all ${
                    actionCategory === cat
                      ? "shadow-xs bg-burgundy-primary text-white"
                      : "border border-brand-border/60 bg-brand-bg text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid max-h-[380px] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
            {quickActions
              .filter((action) => {
                const matchesSearch =
                  action.title.toLowerCase().includes(actionSearch.toLowerCase()) ||
                  action.description.toLowerCase().includes(actionSearch.toLowerCase()) ||
                  (action.subtitle && action.subtitle.toLowerCase().includes(actionSearch.toLowerCase()));
                const matchesCategory = actionCategory === "all" || action.category === actionCategory;
                return matchesSearch && matchesCategory;
              })
              .map((action) => (
                <div
                  key={action.id}
                  onClick={() => {
                    closeModal();
                    if (action.targetTab) {
                      try {
                        sessionStorage.setItem("studentsTableActiveTab", action.targetTab);
                        if (action.id === "add-student") {
                          sessionStorage.setItem("ams_open_add_student", "true");
                        }
                      } catch {
                        // ignore
                      }
                    }
                    if (action.path) {
                      navigate(action.path);
                    } else if (action.modalType) {
                      const m = action.modalType;
                      setTimeout(() => openModal(m), 100);
                    }
                  }}
                  className="shadow-xs group flex cursor-pointer items-center justify-between rounded-xl border border-brand-border bg-white p-3 transition-all hover:border-brand-accent/50 hover:bg-brand-bg/50"
                >
                  <div className="flex min-w-0 items-center gap-2.5 pr-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light-red text-brand-red transition-transform group-hover:scale-110">
                      {action.iconName === "UserPlus" && <UserPlus className="h-4 w-4" />}
                      {action.iconName === "GraduationCap" && <GraduationCap className="h-4 w-4" />}
                      {action.iconName === "UserCheck" && <UserCheck className="h-4 w-4" />}
                      {action.iconName === "CreditCard" && <CreditCard className="h-4 w-4" />}
                      {action.iconName === "BarChart3" && <BarChart3 className="h-4 w-4" />}
                      {action.iconName === "Megaphone" && <Megaphone className="h-4 w-4" />}
                      {action.iconName === "CalendarRange" && <CalendarRange className="h-4 w-4" />}
                      {action.iconName === "Settings" && <Settings className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-text-primary transition-colors group-hover:text-brand-red">
                          {action.title}
                        </span>
                        {action.badge && (
                          <span className="py-0.2 rounded bg-brand-light-red px-1.5 text-[9px] font-bold text-brand-red">{action.badge}</span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[10.5px] text-text-secondary">{action.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    {action.hotkey && (
                      <span className="rounded border border-brand-border bg-brand-bg px-1.5 py-0.5 font-mono text-[9.5px] text-text-muted">
                        {action.hotkey}
                      </span>
                    )}
                    <div className="flex h-6 w-6 items-center justify-center rounded-full text-text-secondary transition-all group-hover:bg-brand-light-red group-hover:text-brand-red">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex items-center justify-between border-t border-brand-border pt-2 text-xs text-text-secondary">
            <span>
              Tip: Shortcuts work directly anywhere with{" "}
              <kbd className="rounded border border-brand-border bg-brand-bg px-1 py-0.5 font-sans">Alt</kbd>
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={closeModal}
            >
              Close Directory
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const QuickActionModals = React.memo(QuickActionModalsComponent);
