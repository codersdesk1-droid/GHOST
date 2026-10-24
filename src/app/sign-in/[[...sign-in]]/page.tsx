import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="grid min-h-[80svh] place-items-center px-5 pt-32 pb-10">
      <Suspense>
        <SignIn />
      </Suspense>
    </div>
  );
}
