import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";
import PageWrapper from "@/components/common/PageWrapper";
import { ClerkProvider } from "@clerk/nextjs";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Thubble",
  description: "AI-powered team brainstorming",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ClerkProvider
          touchSession={false}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />} */}
            <PageWrapper>{children}</PageWrapper>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
