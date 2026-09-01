import { readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import PageTransition from "./PageTransition";
import Preview from "./Preview";
import styles from "./page.module.css";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/fdhijfnpdbflcginkeiclijakmkfdgoa?utm_source=new-tab-site";

type VersionInfo = {
  version: string;
  downloadUrl: string;
  releasedAt?: string;
};

function getVersion(): VersionInfo {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "version.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      version: "1.0.0",
      downloadUrl: "/downloads/new-tab.zip",
    };
  }
}

export default function Home() {
  const version = getVersion();

  return (
    <PageTransition>
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link className={styles.brand} href="/">
          <Image src="/mark.png" alt="" width={28} height={28} />
          New Tab
        </Link>
        <nav className={styles.nav__links} aria-label="Page">
          <a href="#preview">Preview</a>
          <a href="#install">Install</a>
          <a href="#update">Update</a>
          <Link href="/privacy" transitionTypes={["nav-forward"]}>
            Privacy
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <h1>New Tab</h1>
        <p>
          A calm Chrome new tab with weather, Unsplash backgrounds, a pill search bar, and
          one-key AI. Built to feel quiet — not like another dashboard.
        </p>
        <div className={styles.hero__actions}>
          <a className={`${styles.btn} ${styles["btn--primary"]}`} href="/download">
            Download v{version.version}
          </a>
          <a className={`${styles.btn} ${styles["btn--ghost"]}`} href="#install">
            Install guide
          </a>
        </div>
        <div className={styles.meta}>
          <span>Chrome · Edge · Brave</span>
          <span>Manifest V3</span>
          <span>Unpacked install</span>
        </div>
      </section>

      <section className={styles.previewSection} id="preview">
        <Preview />
      </section>

      <section className={`${styles.section} ${styles.reveal}`} id="install">
        <h2>Install in developer mode</h2>
        <p>
          Chrome only auto-updates store extensions. This build installs unpacked — you load
          the folder once, then use the in-extension update banner when a newer zip ships.
        </p>
        <ol className={styles.steps}>
          <li>
            <div>
              <h3>Download the zip</h3>
              <p>
                Grab <a href="/download">new-tab.zip</a>, then unzip it somewhere permanent
                (for example <code>~/Extensions/new-tab</code>).
              </p>
            </div>
          </li>
          <li>
            <div>
              <h3>Open extensions</h3>
              <p>
                Visit <code>chrome://extensions</code> (or <code>edge://extensions</code>).
              </p>
            </div>
          </li>
          <li>
            <div>
              <h3>Turn on Developer mode</h3>
              <p>Toggle Developer mode in the top-right of the extensions page.</p>
            </div>
          </li>
          <li>
            <div>
              <h3>Load unpacked</h3>
              <p>
                Click <strong>Load unpacked</strong> and select the unzipped folder that
                contains <code>manifest.json</code>.
              </p>
            </div>
          </li>
          <li>
            <div>
              <h3>Open a new tab</h3>
              <p>
                Finish setup with your name, then allow location when asked for weather.
                Press Tab in the search bar to switch between web search and AI.
              </p>
            </div>
          </li>
        </ol>

        <h3 className={styles.subheading}>Chrome Web Store</h3>
        <p>
          Prefer a one-click install with automatic updates? New Tab is also on the{" "}
          <a href={CHROME_WEB_STORE_URL} rel="noopener noreferrer" target="_blank">
            Chrome Web Store
          </a>
          .
        </p>
        <div className={styles["note-box"]}>
          <strong>Seeing &ldquo;not trusted by Enhanced Safe Browsing&rdquo;?</strong>
          <p>
            That warning is normal for new Chrome Web Store developers. Google grants
            &ldquo;trusted&rdquo; status after a few months of compliant publishing — it is
            not a sign that the extension is unsafe. If Chrome shows the dialog, choose{" "}
            <strong>Continue to install</strong>.{" "}
            <a
              href="https://support.google.com/chrome/answer/2664769#10745467"
              rel="noopener noreferrer"
              target="_blank"
            >
              Learn more from Google
            </a>
            .
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.reveal}`} id="update">
        <h2>Updating</h2>
        <p>
          Every deploy of this site packs a fresh zip and publishes{" "}
          <code className="mono">/version.json</code>. The extension checks that feed and
          shows a banner when you&apos;re behind. Store installs update automatically.
        </p>
        <div className={styles["update-box"]}>
          <strong>When an update appears</strong>
          <ol>
            <li>Download the new zip from the banner or this page.</li>
            <li>Replace the files in your existing extension folder (keep the same path).</li>
            <li>
              Open <code>chrome://extensions</code> and click the reload icon on New Tab.
            </li>
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.reveal}`} id="features">
        <h2>What you get</h2>
        <p>Everything from the original brief, without the clutter.</p>
        <div className={styles.features}>
          <article className={styles.feature}>
            <h3>Weather</h3>
            <p>Live conditions plus a click-through hourly and 7-day forecast.</p>
          </article>
          <article className={styles.feature}>
            <h3>Backgrounds</h3>
            <p>Unsplash categories by default, or your own uploads.</p>
          </article>
          <article className={styles.feature}>
            <h3>Search + AI</h3>
            <p>Google by default; Tab flips to Acosta or another AI provider.</p>
          </article>
          <article className={styles.feature}>
            <h3>Fonts</h3>
            <p>Bricolage Grotesque out of the box, with Google Fonts or file upload.</p>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Version {version.version}</span>
        <span>
          <Link href="/privacy" transitionTypes={["nav-forward"]}>
            Privacy
          </Link>
          {" · "}
          <a href={CHROME_WEB_STORE_URL} rel="noopener noreferrer" target="_blank">
            Chrome Web Store
          </a>
          {" · "}
          <a href="/download">download</a>
        </span>
      </footer>
    </div>
    </PageTransition>
  );
}
