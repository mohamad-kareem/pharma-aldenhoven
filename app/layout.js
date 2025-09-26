// app/layout.jsx
import "./globals.css";
import Providers from "@/app/(components)/Providers";
import UserDropdown from "@/app/(components)/UserDropdown";
import ActivityTracker from "@/app/(components)/ActivityTracker";

export const metadata = {
  title: "Pharma Aldenhoven",
  description: "Admin Portal - Pharma Aldenhoven",
  icons: {
    icon: "/logo2.png", // for browser tab
    shortcut: "/logo2.png", // for bookmarks
    apple: "/logo2.png", // iOS homescreen icon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* 👇 Add manifest + theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F4C81" />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen relative">
            {/* Floating user dropdown in top-right */}
            <div className="absolute top-4 right-4 z-[9999]">
              <UserDropdown />
            </div>

            {/* Activity tracker (runs silently in background) */}
            <ActivityTracker />

            {/* Page content */}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
