import ContentBlock from "@/components/content-block";
import H1 from "@/components/h1";
import { Button } from "@/components/ui/button";

export default function Account() {
  return (
    <main>
      <H1 className="my-8 text-white">Account</H1>

      <ContentBlock className="flex justify-center items-center flex-col h-[500px]">
        <p className="mb-2">Logged in as ...</p>
        <Button>Log out</Button>
      </ContentBlock>
    </main>
  );
}
