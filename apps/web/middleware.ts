import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const { pathname } = req.nextUrl

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/modules") ||
    pathname.startsWith("/evaluation-finale")

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search)
    return Response.redirect(loginUrl)
  }

  if (pathname === "/login" && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/modules/:path*", "/evaluation-finale/:path*", "/login"],
}
