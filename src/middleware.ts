import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, isLocale } from "./i18n/routing";

const intl = createMiddleware({ ...routing, localeDetection: false });

export default function middleware(req: NextRequest) {
  // "/" -> kayıtlı tercih (cookie) varsa o dil, yoksa varsayılan Türkçe.
  if (req.nextUrl.pathname === "/") {
    const saved = req.cookies.get("NEXT_LOCALE")?.value;
    const locale = isLocale(saved) ? saved : routing.defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }
  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
