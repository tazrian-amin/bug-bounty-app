import { NextResponse } from "next/server";
export default function proxy() {
  // Auth gating runs in server components/layouts using getServerSession.
  // Keeping proxy pass-through avoids edge runtime token decode mismatches.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
