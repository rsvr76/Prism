import { Metadata } from 'next';
import StudentDashboardClient from '@/components/dashboard/StudentDashboardClient';

export const metadata: Metadata = {
  title: 'Student Dashboard & Progress — Prism',
  description: 'Track your DSA learning journey, practice achievements, recent activity, and next recommended milestones in Prism.',
};

export default function DashboardPage() {
  return <StudentDashboardClient />;
}
