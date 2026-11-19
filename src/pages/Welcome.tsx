import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Eye,
  Layers,
  Lock,
  ShieldCheck,
  Moon,
  Sun,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { get, post } from '../lib/api';
import { API_BASE } from '../lib/api';
import { useTheme } from '../lib/theme';
import type { Session } from '../lib/types';
import { Logo } from '../components/Logo';
import { Badge, Button as LegacyButton, Callout, Spinner } from '../components/ui';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Input, Textarea, Label } from '../components/ui/input';
import { useSessionQuery } from '../components/AppShell';

interface Capabilities {
  demoMode: boolean;
  oauthConfigured: boolean;
  scopes: string[];
  limits: { maxJobItems: number; syncMaxPages: number; pageSize: number; maxArchiveBytes: number };
}

const features = [
  {
    icon: Layers,
    title: 'See everything',
    body: 'Posts, replies, reposts and media in one timeline — filtered by date, keyword, or engagement.',
  },
  {
    icon: CalendarClock,
    title: 'Clean by period',
    body: 'Pick a window, preview exactly what will go, and process it in a job that survives restarts.',
  },
  {
    icon: ShieldCheck,
    title: 'Nothing happens by accident',
    body: 'Every deletion needs an explicit confirmation and is written to an activity log you can audit.',
  },
];

export function WelcomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSessionQuery();
  const [error, setError] = useState<string | null>(params.get('error'));
  const [booting, setBooting] = useState(false);

  const { data: capabilities, isLoading } = useQuery({
    queryKey: ['capabilities'],
    queryFn: () => get<Capabilities>('/api/auth/capabilities'),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (session?.authenticated) navigate('/app', { replace: true });
  }, [session?.authenticated, navigate]);

  const demo = useMutation({
    mutationFn: () => post<Session>('/api/auth/demo'),
    onMutate: () => {
      setBooting(true);
      setError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      navigate('/app');
    },
    onError: (err: Error) => {
      setBooting(false);
      setError(err.message);
    },
  });

  const oauthReady = capabilities?.oauthConfigured ?? false;
  const demoReady = capabilities?.demoMode ?? false;

  return (
    <div className="relative min-h-full overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 grid-paper opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-accent/10 blur-3xl dark:bg-accent/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-56 -left-32 size-[480px] rounded-full bg-acid/20 blur-3xl dark:bg-acid/10"
        aria-hidden
      />

      <main className="relative z-10 mx-auto grid w-full max-w-6xl items-start gap-12 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-14">
        <section className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-[11.5px] font-medium text-ink-soft backdrop-blur">
            <Sparkles className="size-3.5 text-accent" />
            A calmer way to deal with your old posts
          </p>
          <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-ink sm:text-[60px]">
            Your timeline,
            <br />
            <span className="italic text-accent">on your terms.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-soft">
            CleanSoc connects to X with OAuth, indexes your own posts, and gives you a reviewable workspace to remove
            what no longer represents you. No scraping. No password. No surprise deletions.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-line bg-surface/70 p-4 backdrop-blur-sm">
                <feature.icon className="size-[18px] text-accent" strokeWidth={1.8} />
                <h2 className="mt-2.5 text-[13px] font-semibold text-ink">{feature.title}</h2>
                <p className="mt-1 text-[12px] leading-[1.55] text-muted">{feature.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-accent" /> Tokens encrypted with AES-256-GCM
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5 text-accent" /> Per-account data isolation
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="size-3.5 text-accent" /> Explicit confirmation before every run
            </span>
          </div>

          <p className="mt-9 max-w-xl text-[11.5px] leading-5 text-muted">
            X's API exposes the 3,200 most recent posts on your timeline. Anything older requires your official data
            archive, which CleanSoc can import manually. Deletions are still performed through X's own endpoints — X does
            not allow third-party apps to import an archive on your behalf.
          </p>
        </section>

        <section className="animate-fade-up lg:sticky lg:top-10" style={{ animationDelay: '80ms' }}>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-float sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">Open your workspace</h2>
              <Badge tone="success" dot>
                Private
              </Badge>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-5 text-muted">
              Sign in with the X account you want to clean up. You can add more accounts later.
            </p>

            {error && (
              <Callout tone="danger" title="Could not sign in" className="mt-4">
                {error}
              </Callout>
            )}

            <div className="mt-6 space-y-3">
              <a
                href={oauthReady ? `${API_BASE}/api/auth/x/start` : undefined}
                aria-disabled={!oauthReady}
                onClick={(event) => {
                  if (!oauthReady) {
                    event.preventDefault();
                    setError(
                      'This server has no X_CLIENT_ID / X_CLIENT_SECRET configured yet. Use the demo workspace below, or add your X app credentials to the backend .env.',
                    );
                  }
                }}
                className={
                  oauthReady
                    ? 'flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-ink text-[14px] font-medium text-canvas transition-opacity hover:opacity-90 dark:bg-ink dark:text-canvas'
                    : 'flex h-12 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl bg-ink/40 text-[14px] font-medium text-canvas/80'
                }
              >
                <XLogo className="size-[15px]" />
                Continue with X
                <ArrowRight className="size-4 opacity-70" />
              </a>

              {!oauthReady && (
                <p className="-mt-1 flex items-start gap-1.5 text-[11.5px] leading-4 text-warn">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                  OAuth is not configured on this deployment. The demo below runs entirely locally.
                </p>
              )}

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted">or try it first</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <LegacyButton
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => demo.mutate()}
                loading={demo.isPending || booting}
                disabled={!demoReady && !isLoading}
              >
                {demo.isPending || booting ? 'Building demo workspace…' : 'Explore the demo workspace'}
              </LegacyButton>
              <p className="text-center text-[11px] leading-4 text-muted">
                {demoReady
                  ? 'A seeded account with ~260 posts, replies and reposts. Deletions are simulated.'
                  : 'Demo mode is disabled on this server.'}
              </p>
            </div>

            <div className="mt-6 space-y-2.5 border-t border-line pt-4">
              {[
                'We never request or store your X password.',
                'Access tokens are encrypted at rest and never sent to the browser.',
                'Disconnecting an account deletes its cached data.',
              ].map((line) => (
                <p key={line} className="flex items-start gap-2 text-[11.5px] leading-4 text-muted">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {line}
                </p>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted">
            By continuing you agree to use CleanSoc only on accounts you own.{' '}
            <Link to="/terms" className="font-medium text-accent hover:underline">Terms</Link>
            {' · '}
            <Link to="/privacy" className="font-medium text-accent hover:underline">Privacy</Link>
          </p>
        </section>

        <section className="mx-auto mt-16 max-w-5xl space-y-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { to: '/features', t: 'Features', d: 'Categories, filters, bulk select, worker, rules, history, archive import, export.' },
              { to: '/how-it-works', t: 'How it works', d: 'Connect, sync, review, delete — four steps to a cleaner timeline.' },
              { to: '/use-cases', t: 'Use cases', d: 'When and why you would reach for CleanSoc.' },
              { to: '/faq', t: 'FAQ', d: 'Answers about confirmation, restoration, passwords, limits, cost.' },
              { to: '/contact', t: 'Contact', d: 'Questions, feedback, or support requests.' },
              { to: '/terms', t: 'Terms & Privacy', d: 'How we handle your data and the rules of use.' },
            ].map((c) => (
              <Link key={c.to} to={c.to} className="card group p-5 transition-colors hover:border-line-strong">
                <div className="text-[14px] font-semibold text-ink group-hover:text-accent">{c.t}</div>
                <p className="mt-1 text-[12.5px] leading-5 text-muted">{c.d}</p>
                <div className="mt-3 text-[12px] font-medium text-accent">Learn more →</div>
              </Link>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="text-[18px] font-semibold text-ink">What CleanSoc does</h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-6 text-ink-soft">
              CleanSoc connects to your X account through OAuth, caches your posts, replies, reposts, and media, and gives
              you a fast, filterable workspace to review and bulk-delete content you no longer want online. Nothing is
              deleted automatically — every removal requires your explicit confirmation.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-line bg-surface/40 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[12.5px] leading-5 text-muted">
              A calmer way to review and clean up your X account. OAuth-only, encrypted tokens, explicit confirmation.
            </p>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Product</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li><Link to="/features" className="text-ink-soft hover:text-ink">Features</Link></li>
              <li><Link to="/how-it-works" className="text-ink-soft hover:text-ink">How it works</Link></li>
              <li><Link to="/use-cases" className="text-ink-soft hover:text-ink">Use cases</Link></li>
              <li><Link to="/faq" className="text-ink-soft hover:text-ink">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Company</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li><Link to="/contact" className="text-ink-soft hover:text-ink">Contact</Link></li>
              <li><Link to="/terms" className="text-ink-soft hover:text-ink">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-ink-soft hover:text-ink">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Connect</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li><a href={API_BASE ? `${API_BASE}/api/auth/x/start` : '/api/auth/x/start'} className="text-ink-soft hover:text-ink">Sign in with X</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-line px-4 pt-6 text-center text-[11px] text-muted sm:px-6">
          &copy; {new Date().getFullYear()} CleanSoc. All rights reserved.
        </div>
      </footer>

      {booting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-canvas/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-4 shadow-float">
            <Spinner className="size-5 text-accent" />
            <div>
              <p className="text-[13px] font-medium text-ink">Seeding your demo account</p>
              <p className="text-[11.5px] text-muted">Generating posts, replies and reposts…</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (message.trim().length < 10) next.message = 'Message must be at least 10 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-[13px] text-ink-soft">
        Thanks, {name}. Your message has been noted. We'll get back to you at {email}.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-lg space-y-3" noValidate>
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        {errors.name && <p className="mt-1 text-[11.5px] text-danger">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        {errors.email && <p className="mt-1 text-[11.5px] text-danger">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
        {errors.message && <p className="mt-1 text-[11.5px] text-danger">{errors.message}</p>}
      </div>
      <Button type="submit">Send message</Button>
    </form>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.4L2.3 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z" />
    </svg>
  );
}
