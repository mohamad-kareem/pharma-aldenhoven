// app/layout.jsx
import "./globals.css";
import Providers from "@/app/(components)/Providers";
import UserDropdown from "@/app/(components)/UserDropdown";

export const metadata = {
  title: "Pharma Aldenhoven",
  description: "Admin Portal - Pharma Aldenhoven",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen relative">
            {/* Floating user dropdown in top-right */}
            <div className="absolute top-4 right-4 z-[9999]">
              <UserDropdown />
            </div>

            {/* Page content */}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
