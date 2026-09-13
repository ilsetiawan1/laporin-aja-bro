import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import * as commentService from "@/lib/services/commentService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await commentService.getComments(id);

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil komentar: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Autentikasi diperlukan untuk menambahkan komentar." },
        { status: 401 }
      );
    }

    const { content, parent_id = null } = body;
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Isi komentar tidak boleh kosong." },
        { status: 400 }
      );
    }

    const result = await commentService.addComment(
      {
        report_id: id,
        content: content.trim(),
        parent_id: parent_id || null,
      },
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Komentar berhasil ditambahkan",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses komentar: " + error.message },
      { status: 500 }
    );
  }
}
