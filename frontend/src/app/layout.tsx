import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VotelikPollerin",
  description: "Decentralized anonymous voting on farcaster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar>
            <NavbarBrand>
              <p className="font-bold text-inherit">VotelikPollerin</p>
            </NavbarBrand>
            <NavbarContent justify="center">
              <NavbarItem>
                <Link color="foreground" href="/">
                  About
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link color="foreground" href="/create">
                  Create
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link color="foreground" href="/polls">
                  Polls
                </Link>
              </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
              
            </NavbarContent>
          </Navbar>
          {children}
        </Providers>
      </body>
    </html>
  );
}
