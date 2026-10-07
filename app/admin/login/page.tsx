import type { Metadata } from "next";
import Login from "@/components/admin/Login";

export const metadata: Metadata = { title: "Admin sign in — SleekViber", robots: { index: false, follow: false } };
export default function AdminLogin() { return <Login />; }
