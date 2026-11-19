import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="grid min-h-full place-items-center bg-canvas px-4 py-16">
      <div className="w-full max-w-md text-center">
        <Link to="/" aria-label="CleanSoc home" className="inline-flex">
          <Logo />
        </Link>
        <div className="mt-8 text-[72px] font-semibold leading-none tracking-[-0.04em] text-ink/15">404</div>
        <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink">Page not found</h1>
        <p className="mt-2 text-[13.5px] leading-5 text-muted">
          The page you're looking for doesn't exist or has moved. Check the URL, or head back to a place you know.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link to="/app">Go to dashboard</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/welcome">Home</Link>
          </Button>
        </div>
        <p className="mt-8 text-[11.5px] text-muted">
          Need help?{' '}
          <Link to="/terms" className="font-medium text-accent hover:underline">Terms</Link>
          {' · '}
          <Link to="/privacy" className="font-medium text-accent hover:underline">Privacy</Link>
        </p>
      </div>
    </div>
  );
}
