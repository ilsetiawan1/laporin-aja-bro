import { createServerClient, getCachedServerUser } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const user = await getCachedServerUser();

  let profile = null;
  if (user) {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, avatar_url, full_name")
      .eq("id", user.id)
      .single();

    profile = data
      ? {
          id: data.id,
          avatar_url: data.avatar_url,
          full_name: data.full_name,
        }
      : { id: user.id };
  }

  return <NavbarClient initialProfile={profile} />;
}
