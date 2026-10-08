import type { Metadata } from "next";
import { TrustPage } from "../_trust/TrustPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What the OpenUI website collects, why, and who processes it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <TrustPage
      title="Privacy"
      lead="What this website collects and who processes it. The OpenUI libraries run in your own app and send us nothing."
    >
      <h2>Scope</h2>
      <p>
        This page covers www.openui.com, operated by Thesys Inc., 355 Bryant St, San Francisco, CA
        94107. The open-source packages (<code>@openuidev/*</code>) execute entirely inside your
        application and do not contact us.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Usage analytics.</strong> We use Google Analytics and PostHog to see which pages
          are visited and how the site is used. These services may set cookies or local storage
          identifiers and receive your IP address and browser details.
        </li>
        <li>
          <strong>Early-access email.</strong> If you submit your email on a waitlist form, we store
          it with our form provider (Tally) to contact you about that product.
        </li>
        <li>
          <strong>Demo prompts.</strong> Text you type into the live demos is sent to our server and
          to the model provider that generates the response.
        </li>
        <li>
          <strong>Server logs.</strong> Our hosting provider keeps standard request logs (IP
          address, URL, user agent) for security and reliability.
        </li>
      </ul>
      <h2>What we do not do</h2>
      <p>We do not sell personal information, and we do not run advertising on this site.</p>
      <h2>Your choices</h2>
      <p>
        You can block analytics with your browser&apos;s tracking protection or a content blocker,
        and clear stored identifiers in your browser settings. To ask for access to or deletion of
        an email you submitted, contact us through the options on the{" "}
        <a href="/contact">contact page</a>.
      </p>
      <h2>Changes</h2>
      <p>
        We will update this page when our practices change. Questions about it are welcome on the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </TrustPage>
  );
}
