export type NavItemId =
  | 'dashboard'
  | 'academics'
  | 'admissions'
  | 'programs'
  | 'staff'
  | 'finance'
  | 'facilities'
  | 'communications'
  | 'reports';

export interface NavItem {
  id: NavItemId;
  label: string;
  iconName: string;
  path: string;
  badge?: string;
  children?: {
    id: string;
    label: string;
    path: string;
  }[];
}

export interface StatCardProps {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: string;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
}

export interface MonthlyOverviewPoint {
  month: string;
  students: number;
  sales?: number;
  target?: number;
  admissions?: number;
  growth?: string;
  isOctober?: boolean;
  isPeak?: boolean;
}

export interface InstituteSalesPoint {
  month: string;
  sales: number; // in Lakhs
  target: number; // in Lakhs
  admissions: number;
  students: number;
  growth: string;
  isOctober?: boolean;
  isPeak?: boolean;
}

export interface PipelineCategory {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface FeeMonthPoint {
  month: string;
  amount: number;
  displayAmount: string;
  isHighlighted?: boolean;
}

export interface PendingPaymentBreakdownPoint {
  period: string;
  tuition: number; // in Lakhs
  application: number; // in Lakhs
  tuitionDisplay: string;
  applicationDisplay: string;
  totalDisplay: string;
  isHighlighted?: boolean;
}

export interface MonthlyStudentPoint {
  month: string;
  students: number;
  newAdmissions?: number;
  growth?: string;
  isHighlighted?: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'admission' | 'fee' | 'staff' | 'program' | 'system' | 'partner' | 'report';
  title: string;
  detail: string;
  timeAgo: string;
  timestamp?: string;
  iconName: string;
  iconBgColor?: string;
  iconColor?: string;
  badge?: string;
  path?: string;
  targetTab?: string;
  performedBy?: string;
  status?: 'completed' | 'pending' | 'review' | 'flagged';
  metadata?: Record<string, string | number>;
}

export interface CoreModule {
  id: string;
  title: string;
  iconName: string;
  path: string;
  isActive?: boolean;
  description: string;
  tag?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  iconName: string;
  description: string;
  modalType?: string;
  path?: string;
  targetTab?: string;
  external?: boolean;
  subtitle?: string;
  category?: 'admissions' | 'academics' | 'finance' | 'admin';
  badge?: string;
  hotkey?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'admission' | 'payment' | 'system' | 'academic' | 'ai' | 'analytics' | 'maintenance';
  period?: 'Today' | 'This Week' | 'Earlier';
  iconType?: 'ai' | 'analytics' | 'maintenance' | 'system' | 'admission' | 'payment' | 'academic';
}

export interface SearchResult {
  id: string;
  title: string;
  category: 'Student' | 'Staff' | 'Program';
  subtitle: string;
  meta?: string;
  path?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  college: string;
  amsVersion: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  bio?: string;
  department?: string;
  joinedDate?: string;
  status?: string;
  lastActive?: string;
  password?: string;
}

export interface ModalState {
  isOpen: boolean;
  modalType: string | null;
  data?: Record<string, unknown>;
}

export interface PendingPaymentCard {
  id: string;
  studentCode: string;
  studentName: string;
  orderRef: string;
  program: string;
  status: 'Ready' | 'In Progress' | 'Pending' | 'Overdue' | 'Due Soon';
  statusSubtext: string;
  date: string;
  time: string;
  currency: string;
  totalFees: number;
  applicationFees: number;
  outstanding: number;
}
