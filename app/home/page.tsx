import { Metadata } from "next";
import StudentDashboardClient from "@/components/dashboard/StudentDashboardClient";

export const metadata: Metadata = {
  title: "Student Home & Dashboard | Prism",
  description: "Your personalized AI DSA workbench, opportunity feed, and progress tracker.",
};

export default function StudentHomePage() {
  return <StudentDashboardClient />;
}
