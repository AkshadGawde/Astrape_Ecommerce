import { ReactNode } from "react";
import "@/app/globals.css";
import Providers from "@/components/Providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}