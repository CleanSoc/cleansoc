import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  Minus,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '../lib/format';

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline' | 'subtle';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-ink hover:bg-accent-hover border border-transparent shadow-[0_1px_0_rgb(255_255_255/0.12)_inset]',
  secondary: 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-raised',
  ghost: 'bg-transparent text-ink-soft hover:bg-raised hover:text-ink border border-transparent',
  subtle: 'bg-accent-soft text-accent border border-transparent hover:brightness-95 dark:hover:brightness-110',
  danger: 'bg-danger text-white hover:brightness-110 border border-transparent',
  dangerOutline: 'bg-transparent text-danger border border-danger/35 hover:bg-danger-soft',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13.5px] gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[14.5px] gap-2.5 rounded-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-150',
        'disabled:pointer-events-none disabled:opacity-45',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors',
        'hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'outline' | 'acid';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-raised text-muted border-line',
  accent: 'bg-accent-soft text-accent border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  outline: 'bg-transparent text-muted border-line',
  acid: 'bg-acid/20 text-ink border-acid/40',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  dot,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5',
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ─── Form controls ────────────────────────────────────────────────────────────

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-line bg-surface px-3 text-[13.5px] text-ink placeholder:text-muted/70',
        'transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted/70',
        'transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-xl border border-line bg-surface pl-3 pr-9 text-[13.5px] text-ink',
          'transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1.5 block text-[12px] font-medium text-ink-soft', className)}>
      {children}
    </label>
  );
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  className,
  disabled,
  size = 'md',
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[6px] border transition-all duration-150',
        size === 'md' ? 'size-[19px]' : 'size-[17px]',
        checked || indeterminate
          ? 'border-accent bg-accent text-accent-ink'
          : 'border-line-strong bg-surface hover:border-accent',
        disabled && 'cursor-not-allowed opacity-40',
        className,
      )}
    >
      {indeterminate ? (
        <Minus className="size-3" strokeWidth={3} aria-hidden />
      ) : checked ? (
        <Check className="size-3" strokeWidth={3.2} aria-hidden />
      ) : null}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = 'md',
  dismissible = true,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dismissible?: boolean;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => panelRef.current?.focus(), 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.stopPropagation();
        onClose();
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/35 backdrop-blur-[3px] dark:bg-black/55"
        onClick={() => dismissible && onClose()}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'relative flex max-h-[92vh] w-full animate-scale-in flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-float focus:outline-none sm:rounded-2xl',
          sizes[size],
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div>
              {title && <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
              {description && <div className="mt-0.5 text-[12.5px] text-muted">{description}</div>}
            </div>
            <IconButton label="Close dialog" onClick={onClose} disabled={!dismissible} className="-mr-1 -mt-1">
              <X className="size-4" />
            </IconButton>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-line bg-raised/60 px-5 py-3.5 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastTone = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  detail?: string;
}

const ToastContext = createContext<{ notify: (message: string, tone?: ToastTone, detail?: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: ToastTone = 'info', detail?: string) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { id, message, tone, detail }]);
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-float"
          >
            <span
              className={cn(
                'mt-0.5 shrink-0',
                toast.tone === 'success' && 'text-success',
                toast.tone === 'error' && 'text-danger',
                toast.tone === 'info' && 'text-accent',
              )}
            >
              {toast.tone === 'success' ? (
                <CheckCircle2 className="size-[18px]" />
              ) : toast.tone === 'error' ? (
                <XCircle className="size-[18px]" />
              ) : (
                <Info className="size-[18px]" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-5 text-ink">{toast.message}</p>
              {toast.detail && <p className="mt-0.5 text-[12px] leading-4 text-muted">{toast.detail}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="rounded p-1 text-muted transition-colors hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden />;
}

export function ProgressBar({
  value,
  tone = 'accent',
  animated = false,
  className,
}: {
  value: number;
  tone?: 'accent' | 'danger' | 'warn';
  animated?: boolean;
  className?: string;
}) {
  const colors = { accent: 'bg-accent', danger: 'bg-danger', warn: 'bg-warn' };
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-line', className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', colors[tone], animated && 'progress-stripes')}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-line bg-raised text-muted">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Callout({
  tone = 'info',
  title,
  children,
  icon,
  className,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'success';
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  const tones = {
    info: 'border-accent/20 bg-accent-soft/50 text-ink',
    warn: 'border-warn/25 bg-warn-soft/60 text-ink',
    danger: 'border-danger/25 bg-danger-soft/60 text-ink',
    success: 'border-success/20 bg-success-soft/50 text-ink',
  };
  const iconTones = { info: 'text-accent', warn: 'text-warn', danger: 'text-danger', success: 'text-success' };
  const defaultIcon = {
    info: <Info className="size-4" />,
    warn: <AlertTriangle className="size-4" />,
    danger: <AlertTriangle className="size-4" />,
    success: <CheckCircle2 className="size-4" />,
  };
  return (
    <div className={cn('flex gap-3 rounded-xl border px-4 py-3', tones[tone], className)}>
      <span className={cn('mt-0.5 shrink-0', iconTones[tone])}>{icon ?? defaultIcon[tone]}</span>
      <div className="min-w-0 text-[12.5px] leading-5">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5', 'text-ink-soft')}>{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] leading-4 text-muted">{hint}</p>}
    </div>
  );
}
