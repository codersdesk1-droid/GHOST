"use client";

import { useState } from "react";

// TODO(phase 2): send to an email provider (e.g. Resend) via a server action.
export default function Newsletter() {
  const [done, setDone] = useState(false);
  return done ? (
    <p className="mt-8 text-sm text-mist">You&apos;re on the list. We&apos;ll be in touch — quietly.</p>
  ) : (
    <form
      className="mt-8 flex max-w-md items-center rounded-full border border-line p-1.5 focus-within:border-bone/40"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <input
        id="nl-email"
        type="email"
        required
        placeholder="your@email.com"
        className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-fog sm:text-sm"
      />
      <button className="rounded-full bg-bone px-5 py-2.5 text-sm text-void transition hover:bg-white">Join</button>
    </form>
  );
}
