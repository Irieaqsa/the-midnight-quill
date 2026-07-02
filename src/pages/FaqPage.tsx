import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqPage() {
  const faqs: FaqItem[] = [
    {
      q: "How do I submit my work?",
      a: "Simply sign up for an account, navigate to the 'Submit' space in the menu, fill in your title, content, select a category, and optionally add tags. You must check the Zero-AI honor declaration before submitting your work."
    },
    {
      q: "What is TMQ's Zero-AI policy and how is it enforced?",
      a: "We believe in raw, original, human emotional expression. We have a strict zero-tolerance policy for text generated, polished, or structured by AI models. Every member signs an attestation. Editors perform manual reviews for stylistic anomalies, and verified AI use results in account suspension."
    },
    {
      q: "What happens after I submit my work?",
      a: "Your submission enters the 'Pending' queue. A human editor (Ritashree, Imran, or Shagnik) will review it. You can track status updates ('In Review', 'Accepted', 'Published', or 'Rejected') on your Dashboard."
    },
    {
      q: "How long does the review process take?",
      a: "Our editorial team typically reviews submissions within 3 to 7 days. If there are notes or suggestions, you will find them attached directly to the submission on your dashboard."
    },
    {
      q: "Do I retain the rights to my work?",
      a: "Yes, completely. By submitting to The Midnight Quill, you grant us a non-exclusive license to display your piece in our public archive and, if selected, perform it on our podcast or feature it in our Substack newsletter."
    },
    {
      q: "How does the podcast work? Can I be featured?",
      a: "Our podcast, 'The Road Which Is Taken', features voice recitals of selected poems and spoken-word scripts published on TMQ. The editorial team selects outstanding pieces and coordinates with casting voices for recording."
    },
    {
      q: "Can I submit previously published work?",
      a: "Yes, as long as you own the full copyrights to the work and it complies with our zero-AI policy."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout>
      <SEOHead 
        title="Frequently Asked Questions — The Midnight Quill"
        description="Find answers to common questions about submitting work, our zero-AI policy, and the editing workflow."
      />
      
      <div className="min-h-[calc(100vh-4rem)] container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Everything you need to know about submissions, editorial reviews, and our values.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4 pt-6">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-card border border-white/5 rounded-lg overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-foreground hover:bg-white/5 transition-colors"
                  >
                    <span className="font-display text-base leading-snug">{faq.q}</span>
                    <ChevronDown className={`h-4.5 w-4.5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-white/5 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </Layout>
  );
}
