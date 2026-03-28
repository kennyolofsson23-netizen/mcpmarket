import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const role = (session.user as { role?: string }).role ?? "USER";
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        <Sidebar role={role} type="admin" />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
