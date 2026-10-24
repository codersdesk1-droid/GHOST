import type { Metadata } from "next";
import Faq from "@/components/Faq";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const { contactEmail } = await getSettings();
  return (
    <div className="mx-auto grid max-w-[1200px] gap-12 px-5 pt-36 sm:px-10 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <p className="eyebrow">Help</p>
        <h1 className="mt-4 font-display text-6xl font-light">Questions, answered quietly.</h1>
        {contactEmail && (
          <p className="mt-6 text-mist">
            Still stuck? Write to{" "}
            <a className="text-bone underline underline-offset-4" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            .
          </p>
        )}
      </div>
      <Faq />
    </div>
  );
}
