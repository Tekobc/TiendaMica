import { obtenerDashboardAdmin } from "@/lib/actions/admin-actions";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const revalidate = 0; // Datos administrativos en vivo

export default async function AdminPage() {
  const [initialData, adminUser] = await Promise.all([
    obtenerDashboardAdmin(),
    getAuthenticatedAdmin(),
  ]);

  return (
    <AdminDashboardClient
      initialData={initialData}
      adminEmail={adminUser?.email ?? "admin@tiendamica.com.ar"}
    />
  );
}
