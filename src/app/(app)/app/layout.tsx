import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";
import BackgroundPattern from "@/components/background-pattern";
import { Toaster } from "@/components/ui/sonner";
import PetContextProvider from "@/contexts/pet-context-provider";
import SearchContextProvider from "@/contexts/search-context-provider";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkAuth, getPetsByUserId } from "@/lib/server-utils";
import { get } from "http";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await checkAuth();
  const pets = await getPetsByUserId(session.user.id);

  return (
    <>
      <BackgroundPattern />
      <div className="flex flex-col m-auto max-w-[1050px] min-h-screen p-4">
        <AppHeader />
        <PetContextProvider data={pets}>
          <SearchContextProvider>{children}</SearchContextProvider>
        </PetContextProvider>
        <AppFooter />
      </div>
      <Toaster position="top-right" />
    </>
  );
}
