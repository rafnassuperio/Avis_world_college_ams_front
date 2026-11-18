import { CollegeStudent } from "../types";

export interface StudentDriveLink {
  id: string;
  title: string;
  url: string;
  addedDate?: string;
  category?: string;
}

export const defaultStudentProfile: CollegeStudent = {
  id: "std-0",
  studentId: "ATCG624/09/001",
  name: "Misriya Salim",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  email: "misriyasalim6@gmail.com",
  phone: "9562941863",
  singaporePhone: "9562941863",
  mobile: "N/A",
  course: "HIGHER DIPLOMA IN IT",
  courseCode: "HDIT",
  category: "School of Computing & AI",
  intake: "January",
  intakeName: "HDIT2601",
  status: "Enrolled",
  nationality: "Indian",
  country: "India",
  location: "Singapore",
  address: "DCFVGBHNJKL./",
  gender: "Male",
  dateOfBirth: "05/09/2000",
  studentType: "International",
  residentialStatus: "N/A",
  class: "N/A",
  college: "Acetek College",
  joinedDate: "05/01/2026",
  enrolledAt: "August 3, 2026 at 10:23 AM",
  editedAt: "November 9, 2026 at 2:21 PM",
  admissionDate: "03 Aug 2026",
  enrollmentDate: "03 Aug 2026",

  // Passes & ID
  passportOrNric: "MDFJHFCVFC",
  passportNo: "MDFJHFCVFC",
  newPassport: "N/A",
  finNumber: "MERDFFB",
  studentPassExpDate: "N/A",
  studentPassCollectionDate: "N/A",
  passportExpDate: "N/A",
  embarkmentCardExpDate: "N/A",
  identityPassType: "N/A",

  // Academic details
  highestQualification: "OTHER POST-SECONDARY CERTIFICATES",
  peCourseTitle: "Diploma in Culinary and Baking",
  studyMode: "N/A",
  courseDeliveryMode: "N/A",
  commencementDate: "05/01/2026",
  completionDate: "05/06/2026",
  applicationDate: "N/A",
  studentStatus: "N/A",

  // Representatives & Agents
  representative: "NONE",
  agent: "TEMP AGENT",

  // Guardian Details
  guardianName: "none",
  guardianNric: "",

  // Payment Status
  totalFees: 2583.3,
  amountPaid: 0,
  pendingAmount: 2583.3,
  paymentStatus: "pending",

  // Metrics
  attendanceCount: "92%",
  leaveCount: "3 Days",
  performanceCount: "88.5%",

  // Google Drive Links
  googleDriveLinks: [
    {
      id: "gdrive-1",
      title: "ICA Student Pass & Visa Endorsement",
      url: "https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ",
      addedDate: "Aug 03, 2026",
    },
    {
      id: "gdrive-2",
      title: "Academic Transcripts & Certificates",
      url: "https://drive.google.com/drive/folders/2bCdEfGhIjKlMnOpQrStUvWxYzA",
      addedDate: "Aug 04, 2026",
    },
    {
      id: "gdrive-3",
      title: "Signed Student Contract & FPS Certificate",
      url: "https://drive.google.com/file/d/3cDeFgHiJkLmNoPqRsTuVwXyZaB/view",
      addedDate: "Nov 09, 2026",
    },
  ],
};

