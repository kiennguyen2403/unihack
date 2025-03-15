import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const NavigationBar = () => {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="px-8 w-full flex gap-5 items-center justify-between font-semibold">
        <Link href={"/"}>LOGO HERE</Link>
        {/* TODO: add logo here */}
        <div className="flex items-center justify-center gap-6 font-light">
          {/* TODO: add list of pages here */}
          <Link href={"/"}>Home</Link>
          <Link href={"/about"}>About</Link>
          <Link href={"/contact"}>Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          {/* TODO: add login and register buttons here */}
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
