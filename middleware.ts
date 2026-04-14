import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Use getUser() — more secure than getSession() in middleware
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ["/dashboard", "/deck", "/practice"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (pathname === "/login" && user) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/deck/:path*", "/practice/:path*", "/login"],
};
