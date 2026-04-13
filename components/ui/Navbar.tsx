import { createServerClient } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, avatar_url, full_name")
      .eq("id", user.id)
      .single();
    

    profile = data ? {
      id: data.id,
      avatar_url: data.avatar_url,
      full_name: data.full_name
    } : { id: user.id };
  }

  return <NavbarClient initialProfile={profile} />;
}