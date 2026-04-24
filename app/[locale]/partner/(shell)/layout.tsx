import type { ReactNode } from "react";
import PartnerSidebar from "../../../components/partner/PartnerSidebar";

export default function PartnerShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      <PartnerSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
