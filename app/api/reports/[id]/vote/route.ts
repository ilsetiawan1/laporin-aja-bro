import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import * as voteService from "@/lib/services/voteService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Autentikasi diperlukan untuk melakukan voting." },
        { status: 401 }
      );
    }

    const result = await voteService.toggleVote(id, user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses vote: " + error.message },
      { status: 500 }
    );
  }
}
