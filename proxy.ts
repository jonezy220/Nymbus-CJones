import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Gate /checkout and all sub-routes — require approvalStatus cookie set at underwriting approval
  if (pathname.startsWith("/checkout")) {
    const approved = req.cookies.get("approvalStatus")?.value;
    if (approved !== "approved") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout", "/checkout/:path*"],
};
