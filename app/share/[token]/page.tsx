import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSharedChatByToken } from "@/lib/supabase/queries";
import { SharedChatView } from "@/components/chat/shared-chat-view";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/share/${token}`);

  const shared = await getSharedChatByToken(supabase, token);
  if (!shared) notFound();

  return (
    <SharedChatView
      session={shared.session}
      dashboard={shared.dashboard}
      messages={shared.messages}
    />
  );
}
