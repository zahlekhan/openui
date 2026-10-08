/* Facts about the site that several machine-readable surfaces repeat
   (JSON-LD, the Markdown homepage). Kept in one place so they cannot
   drift apart. Everything here is already public on the site or in the repo. */

export const SITE_URL = "https://www.openui.com";
export const SITE_NAME = "OpenUI";
export const SITE_DESCRIPTION =
  "Full-stack, renderer-agnostic Generative UI with a streaming-first language, official React support, community integrations, and up to 67% fewer tokens than JSON.";

export const ORGANIZATION = {
  name: "Thesys Inc.",
  url: "https://www.thesys.dev",
  address: {
    streetAddress: "355 Bryant St",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94107",
    addressCountry: "US",
  },
  sameAs: [
    "https://github.com/thesysdev",
    "https://x.com/thesysdev",
    "https://www.linkedin.com/company/thesysdev/",
    "https://www.youtube.com/@thesysdev",
    "https://discord.com/invite/Pbv5PsqUSv",
  ],
} as const;

export const GITHUB_URL = "https://github.com/thesysdev/openui";
export const NPM_CLI_PACKAGE = "@openuidev/cli";
