"use server";

import { createServerClient } from "@/lib/supabase/server";

export type Comment = {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function getComments(reportId: string): Promise<Comment[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, report_id, user_id, content, parent_id, created_at,
      profiles ( full_name, avatar_url )
    `)
    .eq("report_id", reportId)
    .order("created_at", { ascending: true }); // older first

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  // normalize profiles as single object instead of array
  return (data || []).map((row: any) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
  }));
}

export async function postComment(formData: FormData) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk berkomentar." };
  }

  const reportId = formData.get("report_id") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parent_id") as string | null;

  if (!reportId || !content.trim()) {
    return { error: "Komentar tidak boleh kosong." };
  }

  const { error } = await supabase
    .from("comments")
    .insert({
      report_id: reportId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId || null
    });

  if (error) {
    console.error("Error posting comment:", error);
    return { error: "Gagal memposting komentar." };
  }

  return { success: true };
}
