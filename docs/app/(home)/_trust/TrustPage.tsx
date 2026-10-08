import type { ReactNode } from "react";
import { PageHero } from "../components/PageHero/PageHero";
import { Footer } from "../sections/Footer/Footer";
import styles from "./TrustPage.module.css";

/* Shared shell for the plain-text company pages (About, Contact, Privacy):
   the standard page hero, a readable prose column, and the site footer. */
export function TrustPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero title={title} subtitle={lead} smallSubtitle />
      <main className={styles.prose}>{children}</main>
      <Footer />
    </>
  );
}
