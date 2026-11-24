import { useApiCollection } from "./useApiCollection";
import { courses, agents, representatives, intakes } from "@/services/ams";

export function useAdmissionOptions(courseTitle: string) {
  const catalog = useApiCollection(courses);
  const agentList = useApiCollection(agents);
  const repList = useApiCollection(representatives);
  const intakeList = useApiCollection(intakes);
  const course = catalog.data.find(c => c.title === courseTitle || c.id === courseTitle);
  return {
    selectedCourseType: course?.courseType || course?.level || "",
    intakeRows: intakeList.data,
    schemes: course?.feeBreakdownSchemes || [],
    COURSE_CATALOG: catalog.data.map(c => ({ ...c, defaultFee: c.fee })),
    PAYMENT_SCHEMES: (course?.feeBreakdownSchemes || []).map(s => s.id),
    paymentSchemeOptions: (course?.feeBreakdownSchemes || []).map(s => ({ label: s.name, value: s.id })),
    AGENTS_LIST: ["", ...agentList.data.map(a => a.name)],
    REPRESENTATIVES_LIST: ["", ...repList.data.map(r => r.name)],
    INTAKE_NAMES: intakeList.data.map(i => i.name),
    loading: catalog.loading || agentList.loading || repList.loading || intakeList.loading,
    error: catalog.error || agentList.error || repList.error || intakeList.error,
  };
}
