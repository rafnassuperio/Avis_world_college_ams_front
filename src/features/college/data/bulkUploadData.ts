import { CollegeStudent, CollegeCourse, CollegeIntake, CollegeCategory } from "../types";

export const sampleParsedStudents: CollegeStudent[] = [
  {
    id: "bulk-std-101",
    studentId: "AWC-2026-0101",
    name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    email: "vikram.malhotra@avisworld.edu",
    phone: "+230 5712 3456",
    course: "BSc Data Science & AI",
    courseCode: "BSc-DS",
    category: "School of Computing & AI",
    intake: "Spring 2026",
    status: "Enrolled",
    nationality: "Mauritius",
    studentType: "Local",
    passportOrNric: "M9234567A",
    admissionDate: "15 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
  {
    id: "bulk-std-102",
    studentId: "AWC-2026-0102",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    email: "elena.rostova@avisworld.edu",
    phone: "+230 5823 4567",
    course: "MSc Applied Artificial Intelligence",
    courseCode: "MSc-AAI",
    category: "School of Computing & AI",
    intake: "Spring 2026",
    status: "Approved",
    nationality: "France",
    studentType: "International",
    passportOrNric: "FR8829104",
    admissionDate: "18 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
  {
    id: "bulk-std-103",
    studentId: "AWC-2026-0103",
    name: "Chen Wei",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    email: "chen.wei@avisworld.edu",
    phone: "+230 5934 5678",
    course: "Higher Diploma in Software Engineering",
    courseCode: "HD-SE",
    category: "School of Computing & AI",
    intake: "Spring 2026",
    status: "Enrolled",
    nationality: "Singapore",
    studentType: "Overseas",
    passportOrNric: "SG7749201",
    admissionDate: "20 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
  {
    id: "bulk-std-104",
    studentId: "AWC-2026-0104",
    name: "Amara Diallo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "amara.diallo@avisworld.edu",
    phone: "+230 5645 6789",
    course: "MBA Executive Technology Management",
    courseCode: "MBA-ETM",
    category: "School of Business",
    intake: "Spring 2026",
    status: "Enrolled",
    nationality: "Senegal",
    studentType: "International",
    passportOrNric: "SN4491023",
    admissionDate: "22 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
  {
    id: "bulk-std-105",
    studentId: "AWC-2026-0105",
    name: "Kavita Ramgoolam",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    email: "kavita.r@avisworld.edu",
    phone: "+230 5756 7890",
    course: "Diploma in Business Administration",
    courseCode: "DIP-BA",
    category: "School of Business",
    intake: "Spring 2026",
    status: "Reported",
    nationality: "Mauritius",
    studentType: "Local",
    passportOrNric: "M8123456B",
    admissionDate: "25 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
  {
    id: "bulk-std-106",
    studentId: "AWC-2026-0106",
    name: "Liam O'Connor",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    email: "liam.oconnor@avisworld.edu",
    phone: "+230 5867 8901",
    course: "BSc Cloud Computing & DevOps",
    courseCode: "BSc-CC",
    category: "School of Computing & AI",
    intake: "Spring 2026",
    status: "Approved",
    nationality: "Ireland",
    studentType: "International",
    passportOrNric: "IE5539201",
    admissionDate: "28 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
  {
    id: "bulk-std-107",
    studentId: "AWC-2026-0107",
    name: "Zara Al-Mansoor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    email: "zara.almansoor@avisworld.edu",
    phone: "+230 5978 9012",
    course: "Master of Science in Data Science",
    courseCode: "MSc-DS",
    category: "School of Computing & AI",
    intake: "Spring 2026",
    status: "Enrolled",
    nationality: "United Arab Emirates",
    studentType: "Overseas",
    passportOrNric: "AE9918234",
    admissionDate: "29 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
  {
    id: "bulk-std-108",
    studentId: "AWC-2026-0108",
    name: "Tariq Mahmood",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    email: "tariq.mahmood@avisworld.edu",
    phone: "+230 5689 0123",
    course: "Certificate in Digital Marketing & SEO",
    courseCode: "CERT-DM",
    category: "School of Media & Design",
    intake: "Spring 2026",
    status: "Enrolled",
    nationality: "Pakistan",
    studentType: "International",
    passportOrNric: "PK6629102",
    admissionDate: "30 Jan 2026",
    enrollmentDate: "01 Feb 2026",
    joinedDate: "01 Feb 2026",
  },
];

export const sampleParsedCourses: CollegeCourse[] = [
  {
    id: "bulk-crs-1",
    code: "BSc-CS-2026",
    title: "Bachelor of Science in Computer Science",
    level: "Undergraduate",
    category: "School of Computing & AI",
    department: "Computer Science",
    duration: "3 Years",
    seats: 60,
    enrolled: 48,
    fee: "$12,500/year",
    status: "Active",
    intakes: ["Spring 2026", "Autumn 2026"],
  },
  {
    id: "bulk-crs-2",
    code: "MSc-AI-2026",
    title: "Master of Science in Artificial Intelligence",
    level: "Postgraduate",
    category: "School of Computing & AI",
    department: "Artificial Intelligence",
    duration: "2 Years",
    seats: 40,
    enrolled: 32,
    fee: "$15,200/year",
    status: "Active",
    intakes: ["Spring 2026"],
  },
];

export const sampleParsedIntakes: CollegeIntake[] = [
  {
    id: "bulk-intk-1",
    name: "Summer 2026 Cohort",
    intakeName: "Summer 2026 Cohort",
    intakeMonth: "July",
    intakeDate: "01 Jul 2026",
    year: "2026",
    status: "incoming",
    targetEnrollment: 150,
    currentEnrollment: 65,
    activeCoursesCount: 12,
  },
];

export const sampleParsedCategories: CollegeCategory[] = [
  {
    id: "bulk-cat-1",
    name: "School of Applied Life Sciences",
    value: "School of Applied Life Sciences",
    code: "SALS",
    headOfDepartment: "Dr. Rachel Green",
    email: "rachel.g@avisworld.edu",
    totalCourses: 5,
    totalStudents: 140,
    status: "Active",
    description: "Bio-informatics, biomedical technology and food science disciplines.",
  },
];

/** Parse CSV string into an array of student objects */
export function parseStudentsCsv(csvText: string): CollegeStudent[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["']/g, ""));
  const students: CollegeStudent[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Regex matches CSV elements respecting quotes
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
    const cleanedValues = values.map((v) => v.trim().replace(/^"|"$/g, ""));

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cleanedValues[idx] || "";
    });

    const studentId = row["student id"] || row["studentid"] || row["id"] || `AWC-2026-${String(100 + i).padStart(4, "0")}`;
    const name = row["full name"] || row["name"] || `Student ${i}`;
    const email = row["email"] || `${name.toLowerCase().replace(/\s+/g, ".")}@avisworld.edu`;
    const phone = row["phone"] || "+230 5000 0000";
    const course = row["course"] || "BSc Data Science & AI";
    const courseCode = row["course code"] || row["coursecode"] || "BSc-DS";
    const intake = row["intake"] || "Spring 2026";
    const passportOrNric = row["passport/nric"] || row["passport"] || row["nric"] || `ID${1000000 + i}`;
    const studentType = (row["student type"] || row["type"] || "International") as "International" | "Local" | "Overseas";
    const nationality = row["nationality"] || row["country"] || "Mauritius";
    const status = row["status"] || "Enrolled";
    const admissionDate = row["admission date"] || "15 Jan 2026";

    students.push({
      id: `bulk-imported-${Date.now()}-${i}`,
      studentId,
      name,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + (i % 50) * 10000}?w=150&auto=format&fit=crop&q=80`,
      email,
      phone,
      course,
      courseCode,
      category: "School of Computing & AI",
      intake,
      status,
      nationality,
      studentType,
      passportOrNric,
      admissionDate,
      enrollmentDate: admissionDate,
      joinedDate: admissionDate,
    });
  }

  return students;
}

/** Trigger download of formatted template */
export function downloadTemplateCsv(entity: "Students" | "Courses" | "Intakes" | "Categories" = "Students") {
  let filename = `${entity}_Bulk_Upload_Template.csv`;
  let csvContent = "";

  if (entity === "Students") {
    csvContent = [
      "Student ID,Full Name,Email,Phone,Passport/NRIC,Course,Course Code,Intake,Student Type,Nationality,Admission Date,Status",
      "AWC-2026-0101,Vikram Malhotra,vikram.malhotra@avisworld.edu,+230 5712 3456,M9234567A,BSc Data Science & AI,BSc-DS,Spring 2026,Local,Mauritius,15 Jan 2026,Enrolled",
      "AWC-2026-0102,Elena Rostova,elena.rostova@avisworld.edu,+230 5823 4567,FR8829104,MSc Applied Artificial Intelligence,MSc-AAI,Spring 2026,International,France,18 Jan 2026,Approved",
      "AWC-2026-0103,Chen Wei,chen.wei@avisworld.edu,+230 5934 5678,SG7749201,Higher Diploma in Software Engineering,HD-SE,Spring 2026,Overseas,Singapore,20 Jan 2026,Enrolled",
      "AWC-2026-0104,Amara Diallo,amara.diallo@avisworld.edu,+230 5645 6789,SN4491023,MBA Executive Technology Management,MBA-ETM,Spring 2026,International,Senegal,22 Jan 2026,Enrolled",
      "AWC-2026-0105,Kavita Ramgoolam,kavita.r@avisworld.edu,+230 5756 7890,M8123456B,Diploma in Business Administration,DIP-BA,Spring 2026,Local,Mauritius,25 Jan 2026,Reported",
    ].join("\n");
  } else if (entity === "Courses") {
    filename = "Courses_Bulk_Upload_Template.csv";
    csvContent = [
      "Course Code,Course Title,Level,Category,Department,Duration,Seats,Tuition Fee,Status",
      "BSc-CS-2026,Bachelor of Science in Computer Science,Undergraduate,School of Computing & AI,Computer Science,3 Years,60,$12,500/year,Active",
      "MSc-AI-2026,Master of Science in Artificial Intelligence,Postgraduate,School of Computing & AI,Artificial Intelligence,2 Years,40,$15,200/year,Active",
    ].join("\n");
  } else if (entity === "Intakes") {
    filename = "Intakes_Bulk_Upload_Template.csv";
    csvContent = [
      "Intake Name,Intake Month,Intake Year,Start Date,Target Enrollment,Status",
      "Summer 2026 Cohort,July,2026,01 Jul 2026,150,incoming",
      "Autumn 2026 Cohort,October,2026,01 Oct 2026,200,incoming",
    ].join("\n");
  } else {
    filename = "Categories_Bulk_Upload_Template.csv";
    csvContent = [
      "Category Name,Category Code,Head of Department,Email,Status,Description",
      "School of Applied Life Sciences,SALS,Dr. Rachel Green,rachel.g@avisworld.edu,Active,Biomedical and life science disciplines.",
    ].join("\n");
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

