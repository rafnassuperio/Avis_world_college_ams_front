import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RecentActivity } from '@/types';
import {
  FileText,
  IndianRupee,
  UserCheck,
  BookOpen,
  UserPlus,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  Trash2,
  Tag,
  Info,
} from 'lucide-react';
import { toast } from '@/components/common/ToastMessage';

export interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: RecentActivity | null;
  onDismiss?: (id: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  onClose,
  activity,
  onDismiss,
}) => {
  const navigate = useNavigate();

  if (!activity) return null;

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-5 h-5 text-brand-red" />;
      case 'IndianRupee':
        return <IndianRupee className="w-5 h-5 text-brand-red" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-brand-red" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-brand-red" />;
      case 'UserPlus':
        return <UserPlus className="w-5 h-5 text-brand-red" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-brand-red" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-brand-red" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-brand-red" />;
      case 'Users':
        return <Users className="w-5 h-5 text-brand-red" />;
      default:
        return <FileText className="w-5 h-5 text-brand-red" />;
    }
  };

  const getTypeBadgeStyles = (type: RecentActivity['type']) => {
    switch (type) {
      case 'admission':
        return 'bg-brand-light-red text-brand-red border-brand-border';
      case 'fee':
        return 'bg-brand-light-red/90 text-burgundy-primary border-brand-border';
      case 'staff':
        return 'bg-brand-light-red text-brand-red border-brand-border';
      case 'program':
        return 'bg-brand-light-red/80 text-burgundy-primary border-brand-border';
      case 'system':
        return 'bg-brand-light-red/70 text-burgundy-dark border-brand-border';
      case 'partner':
        return 'bg-palette-5/20 text-brand-red border-brand-border';
      case 'report':
        return 'bg-brand-light-red text-brand-red border-brand-border';
      default:
        return 'bg-brand-bg text-text-secondary border-brand-border';
    }
  };

  const handleNavigateToRecord = () => {
    if (!activity.path) return;
    if (activity.targetTab) {
      try {
        sessionStorage.setItem('studentsTableActiveTab', activity.targetTab);
        sessionStorage.setItem('collegeActiveTab', activity.targetTab);
      } catch {
        // ignore
      }
    }
    onClose();
    navigate(activity.path);
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(activity.id);
      toast.success('Activity removed from recent feed');
    }
    onClose();
  };

  const formatExactDate = (timestampStr?: string) => {
    if (!timestampStr) return null;
    const date = new Date(timestampStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const exactDate = formatExactDate(activity.timestamp);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Event Details"
      subtitle="Complete institutional transaction record and event payload"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Hero Card */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-brand-bg/60 border border-brand-border">
          <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-brand-border/60 flex items-center justify-center flex-shrink-0">
            {getActivityIcon(activity.iconName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeBadgeStyles(
                  activity.type
                )}`}
              >
                {activity.badge || activity.type}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-red bg-brand-light-red/80 px-2 py-0.5 rounded-md border border-brand-border">
                <CheckCircle2 className="w-3 h-3 text-brand-red" />
                {activity.status === 'completed' || !activity.status ? 'Logged & Verified' : activity.status}
              </span>
              <span className="text-[10px] font-mono text-text-muted ml-auto">
                ID: {activity.id}
              </span>
            </div>
            <h4 className="text-sm font-bold text-text-primary leading-tight">
              {activity.title}
            </h4>
            <p className="text-xs font-semibold text-brand-red mt-0.5">
              {activity.detail}
            </p>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Timestamp Info */}
          <div className="p-3 rounded-xl border border-brand-border bg-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-light-red/60 flex items-center justify-center flex-shrink-0 text-brand-red">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-text-muted">Recorded Timestamp</p>
              <p className="text-xs font-semibold text-text-primary truncate">
                {exactDate || activity.timeAgo}
              </p>
              <p className="text-[10.5px] text-text-secondary">{activity.timeAgo}</p>
            </div>
          </div>

          {/* Performed By Info */}
          <div className="p-3 rounded-xl border border-brand-border bg-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-light-red/60 flex items-center justify-center flex-shrink-0 text-brand-red">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-text-muted">Authorized Actor</p>
              <p className="text-xs font-semibold text-text-primary truncate">
                {activity.performedBy || 'System Administrator'}
              </p>
              <p className="text-[10.5px] text-text-secondary">Campus Ops Network</p>
            </div>
          </div>
        </div>

        {/* Dynamic Key-Value Metadata Payload if available */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="rounded-xl border border-brand-border bg-white overflow-hidden">
            <div className="px-3.5 py-2 bg-brand-bg/50 border-b border-brand-border flex items-center gap-1.5 text-[11px] font-bold text-text-primary">
              <Tag className="w-3.5 h-3.5 text-brand-red" />
              <span>Context Attributes</span>
            </div>
            <div className="divide-y divide-brand-border/60">
              {Object.entries(activity.metadata).map(([key, val]) => (
                <div key={key} className="px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-text-secondary font-medium">{key}</span>
                  <span className="font-bold text-text-primary text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Audit Notice */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-brand-bg/40 border border-brand-border/60 text-text-secondary text-[11px]">
          <Info className="w-3.5 h-3.5 text-brand-red flex-shrink-0 mt-0.5" />
          <span>
            This transaction is cryptographically logged in the institutional AMS ledger. All state mutations remain traceable for AICTE / NAAC audit compliance.
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-brand-border">
          {onDismiss ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 text-text-muted hover:text-danger text-xs font-semibold transition-colors px-2 py-1.5 rounded-lg hover:bg-danger-light"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            {activity.path && (
              <Button type="button" variant="primary" size="sm" onClick={handleNavigateToRecord}>
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span>Go to Record</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
