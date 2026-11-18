export type RepresentativeStatus = "Active" | "Inactive" | "Suspended";

export interface RepresentativeItem {
  id: string;
  repCode: string;
  name: string; // Full Name
  email: string; // Email Id
  country: string; // Country
  agentCount: number; // Agent Count
  phone: string;
  organization?: string;
  status: RepresentativeStatus;
  avatarUrl: string;
  joinedDate: string;
  region?: string;
  notes?: string;
}
