import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

const EFFECTIVE = 'November 19, 2026';
const UPDATED = 'November 19, 2026';

const sections = [
  { id: 'intro', title: '1. Introduction' },
  { id: 'collect', title: '2. Information we collect' },
  { id: 'sources', title: '3. How we collect information' },
  { id: 'use', title: '4. How we use information' },
  { id: 'sharing', title: '5. Sharing and disclosure' },
  { id: 'third-party', title: '6. Third-party services' },
  { id: 'cookies', title: '7. Cookies and sessions' },
  { id: 'retention', title: '8. Data retention' },
  { id: 'security', title: '9. Security' },
  { id: 'rights', title: '10. Your privacy rights' },
  { id: 'children', title: '11. Children' },
  { id: 'transfers', title: '12. International transfers' },
  { id: 'changes', title: '13. Changes to this policy' },
  { id: 'contact', title: '14. Contact and complaints' },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-24 text-[18px] font-semibold tracking-[-0.015em] text-ink">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[13.5px] leading-6 text-ink-soft">{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13.5px] leading-6 text-ink-soft">{children}</ul>;
}

export function PrivacyPage() {
  return (
    <div className="min-h-full bg-canvas">
      <header className="border-b border-line bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="CleanSoc home">
            <Logo />
          </Link>
          <Link to="/terms" className="text-[12.5px] font-medium text-ink-soft hover:text-ink">
            Terms of Service
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">Legal</div>
        <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[36px]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Effective date: {EFFECTIVE} &middot; Last updated: {UPDATED}
        </p>
        <p className="mt-4 max-w-2xl text-[13.5px] leading-6 text-ink-soft">
          This Privacy Policy explains how CleanSoc ("we", "us") collects, uses, stores, and
          protects personal information when you use the Service. We are committed to handling your
          data in line with the Ghana Data Protection Act, 2012 (Act 843) and other applicable
          data-protection laws.
        </p>

        <nav aria-label="Table of contents" className="mt-8 rounded-xl border border-line bg-surface p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Contents</p>
          <ol className="grid gap-1 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[12.5px] text-ink-soft hover:text-accent">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <H2 id="intro">1. Introduction</H2>
        <P>
          CleanSoc is a review-and-cleanup workspace for X (Twitter) accounts. To provide the
          Service we must process information about you and your X account. We collect only what is
          needed to operate the Service and we do not sell your personal information.
        </P>

        <H2 id="collect">2. Information we collect</H2>
        <P>We collect the following categories of information:</P>
        <Ul>
          <li>
            <strong>Account details (from X):</strong> your X user id, username, display name,
            profile image URL, granted scopes, and token expiry. We never receive or store your X
            password.
          </li>
          <li>
            <strong>Cached content:</strong> your posts, replies, reposts, quote posts, and media
            metadata (including media URLs, dimensions, and alt text) retrieved from the X API or
            imported from an X data archive.
          </li>
          <li>
            <strong>Usage and operational data:</strong> activity log entries (actions such as
            sign-in, sync, cleanup, rule changes), cleanup job records and per-item results,
            saved filters, and archive import records.
          </li>
          <li>
            <strong>Session and device data:</strong> a hashed session token, user agent, and IP
            address, used for authentication and security.
          </li>
          <li>
            <strong>Uploaded files:</strong> X data archive ZIP files you upload for import, which
            are processed and then deleted from our servers.
          </li>
        </Ul>
        <P>
          We do not collect precise location data, contact lists, payment details, or health data.
          Location is not requested by the Service.
        </P>

        <H2 id="sources">3. How we collect information</H2>
        <P>Information is collected when you:</P>
        <Ul>
          <li>Sign in with X through OAuth 2.0 (we receive profile and token data from X).</li>
          <li>Sync your account (we retrieve your recent timeline from the X API).</li>
          <li>Upload an X data archive ZIP for import.</li>
          <li>Use the Service (filters, cleanup jobs, saved rules generate activity records).</li>
          <li>Interact with the web application (session cookie set by your browser).</li>
        </Ul>

        <H2 id="use">4. How we use information</H2>
        <P>We use your information to:</P>
        <Ul>
          <li>Authenticate you and maintain your session.</li>
          <li>Display, filter, and search your cached content.</li>
          <li>Execute cleanup jobs you explicitly confirm, by calling the X API on your behalf.</li>
          <li>Show dashboards, history, and activity logs.</li>
          <li>Enforce rate limits and protect against abuse.</li>
          <li>Improve reliability and diagnose issues (server logs).</li>
        </Ul>
        <P>We do not use your content to train models or for advertising.</P>

        <H2 id="sharing">5. Sharing and disclosure</H2>
        <P>
          We do not sell your personal information. We share data only in the following cases:
        </P>
        <Ul>
          <li>
            <strong>X (Twitter):</strong> we send requests to the X API using your OAuth token to
            read your timeline and perform deletions you confirm.
          </li>
          <li>
            <strong>Service providers:</strong> our hosting and database providers process data on
            our behalf under appropriate safeguards (for example, the PostgreSQL database that
            stores your cached data).
          </li>
          <li>
            <strong>Legal obligations:</strong> where required by law, regulation, or valid legal
            process.
          </li>
          <li>
            <strong>With your consent:</strong> for any other purpose you authorise.
          </li>
        </Ul>

        <H2 id="third-party">6. Third-party services</H2>
        <P>
          CleanSoc relies on the X API for authentication and data access. X's own privacy policy
          governs how X handles your data. We also use standard web infrastructure (hosting,
          database) that may process data incidentally. We do not integrate analytics, advertising,
          or tracking SDKs.
        </P>

        <H2 id="cookies">7. Cookies and sessions</H2>
        <P>
          CleanSoc uses a single session cookie (`cleansoc_session`) that is `httpOnly`,
          `SameSite=Lax`, and (in production) `Secure`. It stores a hashed token, not your password
          or X tokens. The X OAuth flow uses a short-lived browser nonce cookie. We do not use
          tracking or advertising cookies.
        </P>

        <H2 id="retention">8. Data retention</H2>
        <P>
          Your cached posts and account data are retained until you disconnect the account or
          delete your data from Settings. Activity logs are retained with your account. Uploaded
          archive ZIPs are deleted immediately after processing. Session records expire after 30
          days of inactivity (or on sign-out). Demo workspaces older than 7 days are removed
          automatically.
        </P>

        <H2 id="security">9. Security</H2>
        <P>
          We protect your data with: AES-256-GCM encryption of X access and refresh tokens at
          rest (with per-account keying); HTTPS in production; hashed session tokens; Origin/CSRF
          checks on state-changing requests; per-user data isolation in every query; and
          server-side validation of destructive actions. No system is perfectly secure; if you
          suspect a security issue, contact us promptly.
        </P>

        <H2 id="rights">10. Your privacy rights</H2>
        <P>
          Subject to applicable law (including Act 843), you have the right to:
        </P>
        <Ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data (available in Settings, or by contacting us).</li>
          <li>Export your data (available per account from the Accounts page).</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </Ul>
        <P>
          To exercise these rights, use the in-app controls or contact us.{' '}
          <span className="text-muted">
            [Insert the official contact channel and response-time commitment before publishing.]
          </span>
        </P>

        <H2 id="children">11. Children</H2>
        <P>
          The Service is not directed at children under 18, and we do not knowingly collect
          personal information from children. If you believe a child has provided us data, contact
          us and we will delete it.
        </P>

        <H2 id="transfers">12. International transfers</H2>
        <P>
          Your data may be stored and processed in the region of your database provider (for
          example, where your PostgreSQL instance is hosted). Where data is transferred across
          borders, we rely on appropriate safeguards.{' '}
          <span className="text-muted">
            [Confirm the hosting region and any transfer mechanisms with your provider.]
          </span>
        </P>

        <H2 id="changes">13. Changes to this policy</H2>
        <P>
          We may update this Privacy Policy from time to time. The "Last updated" date at the top
          reflects the latest revision. Material changes will be communicated through the Service
          where appropriate.
        </P>

        <H2 id="contact">14. Contact and complaints</H2>
        <P>
          Questions or complaints about this Privacy Policy or our data practices can be directed
          to the application owner.{' '}
          <span className="text-muted">
            [Insert official contact email / postal address before publishing.]
          </span>
        </P>
        <P>
          If you are in Ghana and are not satisfied with our response, you may lodge a complaint
          with the Data Protection Commission of Ghana under Act 843.
        </P>

        <div className="mt-12 border-t border-line pt-6 text-[12px] text-muted">
          See also our{' '}
          <Link to="/terms" className="font-medium text-accent hover:underline">
            Terms of Service
          </Link>
          .
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-[11px] text-muted">
        &copy; {new Date().getFullYear()} CleanSoc. All rights reserved.
      </footer>
    </div>
  );
}
