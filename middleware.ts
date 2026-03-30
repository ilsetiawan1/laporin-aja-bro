import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Re-create response dengan cookie yang sudah di-refresh
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() — authenticate ke Supabase Auth server (bukan dari cookie langsung)
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Protect /lapor
  if (!isAuthenticated && pathname.startsWith("/lapor")) {
    const loginUrl = new URL("/?modal=login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect /admin
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/?modal=login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // WAJIB return supabaseResponse — jangan return NextResponse.next() baru
  // karena cookie refresh token akan hilang
  return supabaseResponse;
}

export const config = {
  matcher: ["/lapor/:path*", "/admin/:path*"],
};