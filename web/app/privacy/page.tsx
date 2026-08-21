import type { Metadata } from "next";
import Image from "next/image";
import styles from "../page.module.css";
import doc from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — New Tab",
  description: "Privacy policy for the New Tab Chrome extension.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <a className={styles.brand} href="/">
          <Image src="/mark.png" alt="" width={28} height={28} />
          New Tab
        </a>
        <nav className={styles.nav__links} aria-label="Page">
          <a href="/#install">Install</a>
          <a href="/privacy">Privacy</a>
        </nav>
      </header>

      <article className={doc.doc}>
        <p className={doc.eyebrow}>Legal</p>
        <h1>Privacy Policy</h1>
        <p className={doc.lede}>
          This policy describes how the New Tab browser extension (“New Tab”, “the
          extension”) handles information. Last updated: 21 August 2026.
        </p>

        <section>
          <h2>Summary</h2>
          <p>
            New Tab is a local new-tab experience. We do not run user accounts, we do
            not sell personal data, and we do not use your data for advertising. Most
            preferences stay on your device. Optional location is used only to show
            local weather.
          </p>
        </section>

        <section>
          <h2>Data stored on your device</h2>
          <p>Using Chrome’s extension storage, New Tab may save:</p>
          <ul>
            <li>Your display name (for the greeting)</li>
            <li>Settings such as clock format, weather on/off, search engine, AI provider, font choices, and background preferences</li>
            <li>Custom background images or font files you upload (stored locally)</li>
            <li>Cached weather coordinates so weather can load more reliably</li>
            <li>Whether you dismissed an update notice</li>
          </ul>
          <p>
            This information is not uploaded to our servers. Clearing the extension or
            removing it deletes this data according to your browser.
          </p>
        </section>

        <section>
          <h2>Location</h2>
          <p>
            Location access is optional. If you allow it, approximate coordinates from
            your browser are sent to{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
              Open-Meteo
            </a>{" "}
            solely to retrieve current conditions and forecast. You can decline during
            setup, skip weather, or turn weather off in settings.
          </p>
        </section>

        <section>
          <h2>Third-party services</h2>
          <p>
            To provide the extension’s features, your browser may contact these
            providers. They may receive standard technical data such as IP address as
            part of ordinary HTTPS requests:
          </p>
          <ul>
            <li>
              <strong>Open-Meteo</strong> — weather and forecast (when location is enabled)
            </li>
            <li>
              <strong>Unsplash</strong> — background images
            </li>
            <li>
              <strong>Google Fonts</strong> — typefaces you use or select
            </li>
            <li>
              <strong>Search / AI destinations you choose</strong> — when you submit a
              query, your browser navigates to that provider (for example Google or
              Acosta) with the text you entered. Those services have their own privacy
              policies.
            </li>
          </ul>
          <p>
            We do not sell your data. Transfers to the providers above are only for
            operating the extension’s stated features (weather, backgrounds, fonts,
            search, and AI).
          </p>
        </section>

        <section>
          <h2>This website</h2>
          <p>
            The New Tab website may be hosted on Vercel and serves documentation,
            downloadable builds, and a public version feed. Server logs typical of web
            hosting (such as IP address and request URL) may be processed by the host
            to operate and secure the site. We do not use the site to build advertising
            profiles.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>
            New Tab is not directed at children under 13, and we do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We may update this policy when the extension or website changes. The “Last
            updated” date at the top will change when we do.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For privacy questions about New Tab, contact the publisher through the
            Chrome Web Store listing support / email channel for this item.
          </p>
        </section>
      </article>

      <footer className={styles.footer}>
        <span>
          <a href="/">Home</a>
        </span>
        <span>
          <a href="/privacy">Privacy</a>
          {" · "}
          <a href="/download">Download</a>
        </span>
      </footer>
    </div>
  );
}
