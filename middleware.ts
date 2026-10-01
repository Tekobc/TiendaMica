import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Middleware de Next.js — maneja protección de rutas /admin/* (CONTEXT.md Sección 10)
// Se ejecuta en el Edge antes que cualquier Server Component o layout.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const devCookie = process.env.NODE_ENV !== "production"
    ? request.cookies.get("admin_dev_session")?.value
    : undefined;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user: any = null;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Ignorar errores transitorios de parseo de auth
    }
  }

  const isAuthenticated = Boolean(user || devCookie);

  // Si ya hay sesión y el admin va a la página de login, redirigir al dashboard
  if (pathname === "/admin/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // La página de login es la única ruta /admin/* que no requiere sesión
  if (pathname === "/admin/login") {
    return response;
  }

  // Para cualquier otra ruta bajo /admin, verificamos si está autenticado
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  }

  return response;
}


export const config = {
  // Aplicar middleware solo a rutas /admin/*
  matcher: ["/admin/:path*"],
};
