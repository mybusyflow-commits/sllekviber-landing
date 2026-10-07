import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import Dashboard from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Builder Pulse — SleekViber", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <Dashboard />;
}
