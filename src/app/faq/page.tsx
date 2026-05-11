import { getMarkdownData } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";
import { Header } from "@/components/Header";
import Link from "next/link";
import { HelpCircle, Clock, ChevronRight, MessageSquare } from "lucide-react";

export default async function FAQPage() {
  const { metadata, content } = getMarkdownData("faq");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ECE8E1] font-body relative overflow-hidden">
      {/* Subtle CRT Scanlines Overlay (matching brand feel but synchronized) */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />

      {/* Valorant Red Glow Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF4655]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF4655]/5 blur-[120px] rounded-full" />

      <Header showLandingButtons={true} />

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-[#FF4655]/10 flex items-center justify-center border border-[#FF4655]/30">
              <HelpCircle className="w-6 h-6 text-[#FF4655]" />
            </div>
            <div>
              <h1 className="font-heading text-4xl uppercase tracking-tighter text-[#FF4655]">
                {metadata.title}
              </h1>
              <div className="flex items-center gap-2 text-[#999999] text-sm mt-1">
                <Clock className="w-4 h-4" />
                <span>Last Updated: {metadata.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* How it works highlight section */}
          <section className="bg-[#0F1923] border border-white/5 p-8 relative overflow-hidden group hover:border-[#FF4655]/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4655]/5 -rotate-45 translate-x-16 -translate-y-16 transition-transform group-hover:scale-110" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#FF4655]" />
                <h2 className="font-heading text-xl uppercase text-[#ECE8E1] tracking-wider">How it works?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                {[
                  { step: "01", title: "Authentication", desc: "Securely log in via Riot Games. We never store your password." },
                  { step: "02", title: "Data Retrieval", desc: "We fetch your skins, buddies, and cards from official APIs." },
                  { step: "03", title: "Processing", desc: "Our engine parses your inventory for a beautiful display." },
                  { step: "04", title: "Dashboard", desc: "Browse your collection in a premium interface." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group/item">
                    <span className="font-heading text-2xl text-[#FF4655]/30 group-hover/item:text-[#FF4655] transition-colors">{item.step}</span>
                    <div>
                      <h3 className="font-heading text-base uppercase text-[#ECE8E1] mb-1">{item.title}</h3>
                      <p className="text-[#999999] text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Other FAQ items */}
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h2 {...props} className="font-heading text-xl uppercase text-[#ECE8E1] mt-12 mb-6 border-l-4 border-[#FF4655] pl-4 tracking-tight" />
                ),
                p: ({ node, ...props }) => (
                  <p {...props} className="text-[#999999] mb-4 leading-relaxed text-lg" />
                ),
                li: ({ node, ...props }) => (
                  <li {...props} className="text-[#999999] mb-2 ml-4 list-none flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-1 text-[#FF4655] shrink-0" />
                    <span>{props.children}</span>
                  </li>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="mt-20 p-8 bg-[#0F1923] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4655]/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
          <h3 className="font-heading text-xl uppercase mb-4 text-[#ECE8E1]">Still have questions?</h3>
          <p className="text-[#999999] mb-6">
            If you have any questions about our privacy practices or how we handle your data, please don't hesitate to contact our support team.
          </p>
          <Link
            href="mailto:support.valorantchecker@gmail.com"
            className="inline-block px-6 py-3 bg-white/5 border border-white/10 hover:bg-[#FF4655] hover:border-[#FF4655] transition-all font-heading uppercase text-sm tracking-widest cursor-pointer"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
