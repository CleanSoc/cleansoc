import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input, Textarea, Label } from '../components/ui/input';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (message.trim().length < 10) next.message = 'Message must be at least 10 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Contact</h1>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">
        Questions, feedback, or support requests.
      </p>
      {submitted ? (
        <div className="mt-6 max-w-lg rounded-xl border border-line bg-surface p-4 text-[13.5px] text-ink-soft">
          Thanks, {name}. Your message has been noted. We'll get back to you at {email}.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 max-w-lg space-y-4" noValidate>
          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            {errors.name && <p className="mt-1 text-[11.5px] text-danger">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            {errors.email && <p className="mt-1 text-[11.5px] text-danger">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="c-message">Message</Label>
            <Textarea id="c-message" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
            {errors.message && <p className="mt-1 text-[11.5px] text-danger">{errors.message}</p>}
          </div>
          <Button type="submit">Send message</Button>
        </form>
      )}
    </div>
  );
}
