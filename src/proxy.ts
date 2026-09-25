import { type NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/preview-auth";

/**
 * Optional password protection for preview deployments. When PREVIEW_PASSWORD is set, every
 * page asks for it (HTTP Basic auth; any username). Unset in production.
 */
export function proxy(request: NextRequest) {
  const password = process.env.PREVIEW_PASSWORD;
  if (!password || isAuthorized(request.headers.get("authorization"), password)) {
    return NextResponse.next();
  }
  return new NextResponse("Password required to view this preview.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Pamar Enterprises preview", charset="UTF-8"' },
  });
}

export const config = {
  // Static build assets don't need the check; the browser reuses the credentials anyway.
  matcher: ["/((?!_next/static|_next/image|icon\\.png).*)"],
};
