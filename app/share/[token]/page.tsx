import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSharedChatByToken } from "@/lib/supabase/queries";
import { withNextParam } from "@/lib/auth/next-path";
import { SharedChatView } from "@/components/chat/shared-chat-view";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // proxy.ts normally redirects first; this covers requests it lets through
  if (!user) redirect(withNextParam("/login", `/share/${token}`));

  const shared = await getSharedChatByToken(supabase, token);
  if (!shared) notFound();

  return <SharedChatView {...shared} />;
}
