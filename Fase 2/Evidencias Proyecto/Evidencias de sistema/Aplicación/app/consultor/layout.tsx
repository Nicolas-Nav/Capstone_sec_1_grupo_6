import DashboardLayout from "../dashboard-layout"

export default function ConsultorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
