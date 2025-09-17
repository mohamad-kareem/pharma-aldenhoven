// middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized: ({ token }) => {
      // Allow only karim to access /user-activity
      if (token?.name === "karim") return true;
      // Block if trying to access user-activity and not karim
      if (
        token &&
        !token.name === "karim" &&
        token.path?.startsWith("/user-activity")
      ) {
        return false;
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/signup/:path*",
    "/schedule/:path*",
    "/dashboard/:path*",
    "/employees/:path*",
    "/admin/:path*",
    "/medicine/:path*",
    "/user-activity/:path*", // 👈 protect this page
  ],
};
