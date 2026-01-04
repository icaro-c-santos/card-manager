import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Card Manager - Credit Card Expense Tracker",
  description: "Simple credit card expense management with installment tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}

