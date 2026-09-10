import { AdminDashboard } from "@/components/AdminDashboard";
import { listPartiesForAdmin } from "@/server/admin";

// Always render fresh — this reads live guest/completion counts and has no
// dynamic route segment to make Next skip build-time static generation.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const parties = await listPartiesForAdmin();
  return <AdminDashboard initialParties={parties} />;
}
