// middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin", // redirect if not logged in
  },
});

export const config = {
  matcher: [
    "/schedule/:path*",
    "/dashboard/:path*",
    "/employees/:path*",
    "/admin/:path*",
  ],
};
