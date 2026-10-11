import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AuthBadge() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  const cls = "flex w-full items-center gap-2 rounded-lg border border-navy-foreground/10 bg-navy-foreground/5 px-3 py-2 text-xs font-semibold text-navy-foreground hover:bg-navy-foreground/10";
  if (!email) return <Link to="/auth" className={cls}><LogIn className="h-3.5 w-3.5" />Sign in to save records</Link>;
  return (
    <button onClick={() => supabase.auth.signOut()} className={cls} title="Sign out">
      <LogOut className="h-3.5 w-3.5" /><span className="truncate">{email}</span>
    </button>
  );
}
