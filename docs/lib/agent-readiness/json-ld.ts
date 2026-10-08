import { GITHUB_URL, ORGANIZATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

/* Homepage identity as schema.org JSON-LD: the product (SoftwareApplication)
   and the company behind it (Organization). contactPoint points at the public
   contact page by URL; no mailbox is published on the site, so none is claimed. */
export function homeJsonLd() {
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: `${SITE_URL}/shiro-logo.svg`,
    sameAs: ORGANIZATION.sameAs,
    address: { "@type": "PostalAddress", ...ORGANIZATION.address },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/contact`,
      availableLanguage: "English",
    },
  };
  const software = {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    license: "https://github.com/thesysdev/openui/blob/main/LICENSE",
    codeRepository: GITHUB_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
  return { "@context": "https://schema.org", "@graph": [organization, software] };
}
