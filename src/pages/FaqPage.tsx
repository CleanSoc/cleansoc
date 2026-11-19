import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const faqs = [
  { q: 'Can CleanSoc delete posts without my confirmation?', a: 'No. Every job requires you to type DELETE and acknowledge irreversibility.' },
  { q: 'Can deleted posts be restored?', a: 'No. Deletion on X is permanent and cannot be undone by CleanSoc or X.' },
  { q: 'Does CleanSoc store my X password?', a: 'No. Authentication is OAuth only; tokens are encrypted at rest with AES-256-GCM.' },
  { q: 'How many posts can the API access?', a: 'X exposes up to 3,200 recent posts via the API. Older posts require an X data archive import.' },
  { q: 'Is there a cost?', a: 'CleanSoc itself is free to use. X may require a paid API tier for live sync and deletion.' },
  { q: 'Who can use CleanSoc?', a: 'Anyone who owns the X account they connect. CleanSoc only operates on accounts you authorize.' },
  { q: 'What happens if a deletion fails?', a: 'Failed items are reported with error codes. You can retry failed items from the job detail page.' },
  { q: 'Does CleanSoc run automatically?', a: 'No. Nothing is deleted without your explicit confirmation.' },
  { q: 'Can I export my data?', a: 'Yes. You can export your cached posts and job history as JSON from the Accounts page.' },
  { q: 'How do I remove my data?', a: 'Disconnect an account or delete your entire workspace from Settings. Cached data is removed.' },
];

export function FaqPage() {
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Frequently asked questions</h1>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">Answers to common questions about CleanSoc.</p>
      <Accordion type="single" collapsible className="mt-6">
        {faqs.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
