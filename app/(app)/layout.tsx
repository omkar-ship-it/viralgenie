import { Suspense } from "react";
import { AppNav } from "@/components/app/AppNav";
import { CategoryHeader } from "@/components/app/CategoryHeader";
import { StoreHydrator } from "@/components/app/StoreHydrator";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHydrator />
      <AppNav />
      <Suspense fallback={null}>
        <CategoryHeader />
      </Suspense>
      {children}
    </>
  );
}
