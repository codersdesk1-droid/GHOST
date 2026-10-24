import Link from "next/link";
import { Sparkle } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="relative grid min-h-[80svh] place-items-center overflow-hidden px-5 pt-24 text-center">
      <div className="fog -z-10" />
      <div>
        <Sparkle className="mx-auto h-5 w-5 animate-pulse text-bone" />
        <h1 className="mt-8 font-display text-[clamp(4rem,14vw,10rem)] leading-none font-light italic">Vanished.</h1>
        <p className="mt-6 text-mist">This page has ghosted you. It happens.</p>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-bone px-8 py-4 text-void transition hover:bg-white">
          Back to the living
        </Link>
      </div>
    </div>
  );
}
