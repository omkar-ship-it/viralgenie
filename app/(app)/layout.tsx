import { AppNav } from "@/components/app/AppNav";
import { StoreHydrator } from "@/components/app/StoreHydrator";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHydrator />
      <AppNav />
      {children}
    </>
  );
}
