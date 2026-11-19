import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { cn } from '../lib/format';

const EFFECTIVE = 'November 19, 2026';
const UPDATED = 'November 19, 2026';

interface Section {
  id: string;
  title: string;
}

const sections: Section[] = [
  { id: 'acceptance', title: '1. Acceptance of terms' },
  { id: 'description', title: '2. Description of the service' },
  { id: 'accounts', title: '3. Accounts and eligibility' },
  { id: 'conduct', title: '4. User conduct' },
  { id: 'prohibited', title: '5. Prohibited activities' },
  { id: 'content', title: '6. Your content and data' },
  { id: 'deletion', title: '7. Deletion and irreversibility' },
  { id: 'third-party', title: '8. Third-party services (X)' },
  { id: 'availability', title: '9. Service availability and changes' },
  { id: 'termination', title: '10. Suspension and termination' },
  { id: 'disclaimer', title: '11. Disclaimers' },
  { id: 'liability', title: '12. Limitation of liability' },
  { id: 'indemnity', title: '13. Indemnification' },
  { id: 'law', title: '14. Governing law and disputes' },
  { id: 'changes', title: '15. Changes to these terms' },
  { id: 'contact', title: '16. Contact' },
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

export function TermsPage() {
  return (
    <div className="min-h-full bg-canvas">
      <header className="border-b border-line bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="CleanSoc home">
            <Logo />
          </Link>
          <Link to="/privacy" className="text-[12.5px] font-medium text-ink-soft hover:text-ink">
            Privacy Policy
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">Legal</div>
        <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[36px]">
          Terms of Service
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Effective date: {EFFECTIVE} &middot; Last updated: {UPDATED}
        </p>
        <p className="mt-4 max-w-2xl text-[13.5px] leading-6 text-ink-soft">
          These Terms of Service ("Terms") govern your access to and use of CleanSoc (the
          "Service"). By creating an account or using the Service, you agree to be bound by
          these Terms. If you do not agree, do not use the Service.
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

        <H2 id="acceptance">1. Acceptance of terms</H2>
        <P>
          By accessing or using CleanSoc, you confirm that you are at least 18 years old (or the
          age of majority in your jurisdiction), that you have the authority to enter into these
          Terms, and that you accept them in full. If you use the Service on behalf of an
          organisation, you represent that you are authorised to bind that organisation.
        </P>

        <H2 id="description">2. Description of the service</H2>
        <P>
          CleanSoc is a review-and-cleanup workspace for X (Twitter) accounts. It connects to X
          through OAuth 2.0, caches your own posts, replies, reposts, and media, and lets you
          filter, select, and delete content in controlled batches. The Service is provided on an
          "as is" and "as available" basis.
        </P>

        <H2 id="accounts">3. Accounts and eligibility</H2>
        <P>
          You must connect an X account that you own and are authorised to manage. You are
          responsible for all activity that occurs under your CleanSoc workspace. You may connect
          multiple X accounts to one workspace and switch between them. Keep your session secure;
          CleanSoc uses a session cookie and never stores your X password.
        </P>

        <H2 id="conduct">4. User conduct</H2>
        <P>You agree to use the Service only for lawful purposes and only on accounts you own. You will:</P>
        <Ul>
          <li>Use the Service in compliance with X's terms and policies.</li>
          <li>Provide accurate information and keep it up to date.</li>
          <li>Protect your session and device.</li>
          <li>Review selections carefully before confirming any deletion.</li>
        </Ul>

        <H2 id="prohibited">5. Prohibited activities</H2>
        <P>You must not:</P>
        <Ul>
          <li>Use the Service on an X account you do not own or are not authorised to manage.</li>
          <li>Attempt to access, modify, or delete another user's data.</li>
          <li>Reverse-engineer, scrape, or attempt to extract the Service's source beyond its
            intended use.</li>
          <li>Interfere with, overload, or disrupt the Service or its infrastructure.</li>
          <li>Use the Service to evade X's rate limits or policies in a way that violates them.</li>
          <li>Use the Service for any unlawful purpose.</li>
        </Ul>

        <H2 id="content">6. Your content and data</H2>
        <P>
          You retain ownership of the content you create on X. CleanSoc caches a copy of your
          posts, replies, reposts, and media to provide filtering and review. Cached data is tied
          to your workspace and is deleted when you disconnect the account or delete your data.
          CleanSoc does not claim any rights to your content.
        </P>

        <H2 id="deletion">7. Deletion and irreversibility</H2>
        <P>
          Deletion through CleanSoc is permanent. X cannot restore deleted posts, and CleanSoc
          cannot recover them. Every job requires you to type "DELETE" and acknowledge that the
          action is irreversible. CleanSoc processes deletions sequentially and pauses on X rate
          limits, resuming automatically. A detailed success/failure report is provided. You are
          solely responsible for verifying your selection before confirming.
        </P>

        <H2 id="third-party">8. Third-party services (X)</H2>
        <P>
          The Service depends on the X API. CleanSoc is not affiliated with, endorsed by, or
          sponsored by X Corp. Availability, rate limits, and features are subject to X's terms
          and may change without notice. CleanSoc cannot guarantee access to X data beyond what
          the X API provides (for example, only the 3,200 most recent posts are available via the
          API; older posts require a data archive you download from X).
        </P>

        <H2 id="availability">9. Service availability and changes</H2>
        <P>
          CleanSoc may be modified, suspended, or discontinued at any time. Maintenance, updates,
          or factors outside our control may affect availability. We are not liable for any loss
          resulting from downtime.
        </P>

        <H2 id="termination">10. Suspension and termination</H2>
        <P>
          We may suspend or terminate your access if you breach these Terms or use the Service in
          a way that harms other users, the Service, or third parties. You may stop using the
          Service at any time and delete your data from the Settings page.
        </P>

        <H2 id="disclaimer">11. Disclaimers</H2>
        <P>
          The Service is provided "as is" and "as available", without warranties of any kind,
          express or implied, including but not limited to merchantability, fitness for a
          particular purpose, and non-infringement. CleanSoc does not warrant that the Service
          will be uninterrupted, error-free, or secure.
        </P>

        <H2 id="liability">12. Limitation of liability</H2>
        <P>
          To the maximum extent permitted by law, CleanSoc and its operators shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages, or any loss
          of data, profits, or goodwill, arising from your use of the Service, including the
          deletion of content. Our total liability for any claim arising out of these Terms or the
          Service is limited to the amount you paid us in the twelve months preceding the claim
          (if any).
        </P>

        <H2 id="indemnity">13. Indemnification</H2>
        <P>
          You agree to indemnify and hold harmless CleanSoc and its operators from any claims,
          damages, losses, or expenses (including reasonable legal fees) arising from your use of
          the Service, your breach of these Terms, or your violation of any third-party right.
        </P>

        <H2 id="law">14. Governing law and disputes</H2>
        <P>
          These Terms are governed by the laws of the Republic of Ghana. Any dispute arising out
          of or relating to these Terms or the Service shall be subject to the exclusive
          jurisdiction of the courts of Ghana, sitting in Accra, unless otherwise required by
          applicable law.{' '}
          <span className="text-muted">
            [Confirm the preferred venue and any arbitration clause with legal counsel.]
          </span>
        </P>

        <H2 id="changes">15. Changes to these terms</H2>
        <P>
          We may update these Terms from time to time. The "Last updated" date at the top of this
          page reflects the latest revision. Continued use of the Service after changes take
          effect constitutes acceptance of the revised Terms.
        </P>

        <H2 id="contact">16. Contact</H2>
        <P>
          Questions about these Terms can be directed to the application owner.{' '}
          <span className="text-muted">
            [Insert official contact email / postal address before publishing.]
          </span>
        </P>

        <div className="mt-12 border-t border-line pt-6 text-[12px] text-muted">
          See also our{' '}
          <Link to="/privacy" className="font-medium text-accent hover:underline">
            Privacy Policy
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
