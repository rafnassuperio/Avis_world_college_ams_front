export interface CollegeDetails {
  currency?: string;
  id?: string;
  name: string;
  image: string;
  place: string;
  phone: string;
  email: string;
}

export type CollegeTabId = "students" | "courses" | "intakes" | "categories" | "overseas-requests" | "bulk-upload";

export interface CollegeSubTabItem {
  id: string;
  label: string;
  shortLabel?: string;
  badge?: string | number;
  badgeVariant?: "default" | "alert" | "neutral" | "brand" | "success";
  disabled?: boolean;
}

export interface CollegeTabItem {
  id: CollegeTabId;
  label: string;
  shortLabel?: string;
  iconName: string;
  badge?: string | number;
  badgeVariant?: "default" | "alert" | "neutral" | "brand";
  description?: string;
  subTabs?: CollegeSubTabItem[] | false;
  hasChildTabs?: boolean;
}

export interface CollegeStudent {
  id: string;
  studentId: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  course: string;
  courseCode: string;
  category: string;
  intake: string;
  status: "Enrolled" | "Rejected" | "Approved" | "Reported" | string;
  nationality: string;
  joinedDate: string;
  gpa?: string;
  passportOrNric?: string;
  passportNo?: string;
  nric?: string;
  country?: string;
  location?: string;
  admissionDate?: string;
  enrollmentDate?: string;
  studentType?: "International" | "Local" | "Overseas";
  salutation?: "Mr" | "MS" | string;
  finNumber?: string;
  idType?: "NRIC" | "Passport" | string;
  idNumber?: string;
  dateOfBirth?: string;
  courseType?: "Post Graduation" | "Higher Diploma" | "Diploma" | "Certificate" | string;
  coursePaymentScheme?: string;
  agent?: string;
  representative?: string;
  intakeName?: string;
  intakeMonth?: string;
  intakeDate?: string;
  finalExamResultDate?: string;
  confermentDate?: string;
  completionDate?: string;
  discount?: string;
  totalCourseAmount?: string;
  paymentMethod?: "One Time Settlement" | "Installment" | string;
  address?: string;
  college?: string;
  enrolledAt?: string;
  editedAt?: string;
  gender?: string;
  newPassport?: string;
  residentialStatus?: string;
  class?: string;
  studentPassExpDate?: string;
  studentPassCollectionDate?: string;
  passportExpDate?: string;
  embarkmentCardExpDate?: string;
  commencementDate?: string;
  mobile?: string;
  singaporePhone?: string;
  highestQualification?: string;
  peCourseTitle?: string;
  identityPassType?: string;
  studyMode?: string;
  courseDeliveryMode?: string;
  applicationDate?: string;
  studentStatus?: string;
  guardianName?: string;
  guardianNric?: string;
  totalFees?: number | string;
  amountPaid?: number | string;
  pendingAmount?: number | string;
  paymentStatus?: "pending" | "partial" | "paid" | string;
  attendanceCount?: string | number;
  leaveCount?: string | number;
  performanceCount?: string | number;
  googleDriveLinks?: Array<{ id: string; title: string; url: string; addedDate?: string; category?: string }>;
}

export interface CourseRequirement {
  id: string;
  category?: string;
  description: string;
}

export interface CourseFeeBreakdown {
  totalFee?: number;
  discount?: number;
  id: string;
  name: string;
  schemeCode: string;
  tuitionFee: number;
  medicalInsurance: number;
  resourceFee: number;
  assessmentFee: number;
  feeProtection: number;
  uniformFee: number;
  adminFee: number;
  gstRate?: number;
  currency?: string;
}

export interface CollegeCourse {
  id: string;
  code: string;
  title: string;
  level: "Undergraduate" | "Postgraduate" | "Diploma" | "Certificate" | string;
  courseType?: string;
  category: string;
  department: string;
  duration: string;
  durationDetail?: string;
  seats: number;
  enrolled: number;
  fee: string;
  applicationFee?: string;
  requirementDescription?: string;
  requirements?: CourseRequirement[];
  feeBreakdownSchemes?: CourseFeeBreakdown[];
  status: "Active" | "Upcoming" | "Under Review";
  intakes: string[];
}

export type IntakeStatus = "ongoing" | "incoming" | "closed" | string;

export interface IntakeTimetableSession {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | string;
  startTime: string;
  endTime: string;
  moduleCode: string;
  moduleName: string;
  lecturer: string;
  venue: string;
  type: "Lecture" | "Lab" | "Tutorial" | "Workshop" | string;
}

export interface IntakeTimetable {
  id: string;
  classCode: string;
  courseTitle: string;
  courseCode: string;
  academicYear?: string;
  term?: string;
  intakeName?: string;
  room: string;
  lecturerLead: string;
  scheduleDays: string;
  scheduleTime: string;
  totalHoursPerWeek?: number;
  pdfUrl?: string;
  sessions?: IntakeTimetableSession[];
}

export interface CollegeIntake {
  id: string;
  name: string;
  intakeName?: string;
  intakeMonth?: string;
  intakeDate?: string;
  completionDate?: string;
  finalExamResultDate?: string;
  confermentDate?: string;
  year?: string;
  status: "ongoing" | "incoming" | "closed" | "Open" | "Closing Soon" | "Closed" | "Upcoming" | string;
  term?: string;
  academicYear?: string;
  deadline?: string;
  orientationDate?: string;
  commenceDate?: string;
  targetEnrollment?: number;
  currentEnrollment?: number;
  activeCoursesCount?: number;
  timetables?: IntakeTimetable[];
}

export interface CollegeCategory {
  id: string;
  name: string;
  value: string;
  code?: string;
  headOfDepartment?: string;
  email?: string;
  totalCourses?: number;
  totalStudents?: number;
  status?: "Active" | "Inactive" | string;
  description?: string;
  iconName?: string;
}

export interface CollegeOverseasRequest {
  documents?: Array<{ id: string; name: string; status: string; detail: string }>;
  id: string;
  requestId: string;
  applicantName: string;
  avatar: string;
  country: string;
  countryCode: string;
  passportNo: string;
  requestedCourse: string;
  requestedIntake: string;
  submissionDate: string;
  status: "Pending Review" | "Documents Verified" | "Visa In Process" | "Approved" | "Rejected";
  documentsSubmitted: number;
  documentsTotal: number;
  email: string;
}

export interface CollegeBulkUploadHistory {
  id: string;
  fileName: string;
  entityType: "Students" | "Courses" | "Intakes" | "Categories";
  uploadedAt: string;
  uploadedBy: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  status: "Completed" | "Warnings" | "Failed";
  fileSize: string;
}
