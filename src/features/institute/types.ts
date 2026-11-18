export type InstituteStatus = "Active" | "Inactive" | "Pending";

export type InstituteCategory =
  | "Main Campus"
  | "Branch Campus"
  | "Affiliated Institute"
  | "Partner University"
  | "Research Center";

export interface InstituteItem {
  id: string;
  instituteCode: string;
  name: string;
  imageUrl: string;
  email: string;
  contactNo: string;
  country: string;
  address: string;
  googleLocation: string;
  status: InstituteStatus;
  category?: InstituteCategory;
  website?: string;
  establishedYear?: number | string;
  studentCapacity?: number;
  createdAt?: string;
}

export type InstituteSortOption =
  | "recent"
  | "name-asc"
  | "name-desc"
  | "country-asc"
  | "code-asc";
