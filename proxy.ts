import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath, withNextParam } from "@/lib/auth/next-path";

/** Crawler files, social image, and legal pages must never bounce to /login. */
const PUBLIC_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/twitter-image",
  "/privacy",
  "/terms",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the OAuth callback pass through untouched — creating a Supabase client
  // here would modify request.cookies (via setAll) and wipe the PKCE code
  // verifier before the route handler gets a chance to exchange it.
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next({ request });
  }

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add any code between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPublicApi = pathname.startsWith("/api/public");
  // Marketing landing + demo booking are public; product lives under /app
  const isPublicMarketing =
    pathname === "/" ||
    pathname === "/book-demo" ||
    pathname.startsWith("/book-demo/") ||
    PUBLIC_PATHS.has(pathname);

  if (!user && !isAuthPage && !isPublicApi && !isPublicMarketing) {
    // Remember the page (e.g. /share/<token>) so login/signup can return to it; API calls have no page
    const next = pathname.startsWith("/api/") ? null : safeNextPath(pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(withNextParam("/login", next), request.url));
  }

  if (user && isAuthPage) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next ?? "/app", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
