import ContentBlock from "@/components/content-block";
import H1 from "@/components/h1";
import SignOutBtn from "@/components/sign-out";
import { auth } from "@/lib/auth-no-edge";
import { redirect } from "next/navigation";

export default async function Account() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <H1 className="my-8 text-white">Account</H1>

      <ContentBlock className="flex justify-center items-center flex-col h-[500px]">
        <p className="mb-3">Logged in as {session?.user?.email}</p>
        <SignOutBtn />
      </ContentBlock>
    </main>
  );
}
