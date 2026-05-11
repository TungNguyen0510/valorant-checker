import { getMarkdownData } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";
import { Header } from "@/components/Header";
import Link from "next/link";
import { FileText, Clock } from "lucide-react";

export default async function TermsPage() {
  const { metadata, content } = getMarkdownData("terms-of-service");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ECE8E1]">
      <Header showLandingButtons={true} />

      <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-[#FF4655]/10 flex items-center justify-center border border-[#FF4655]/30">
              <FileText className="w-6 h-6 text-[#FF4655]" />
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

        <div className="prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <div className="mt-20 p-8 bg-[#0F1923] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4655]/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
          <h3 className="font-heading text-xl uppercase mb-4 text-[#ECE8E1]">Legal Agreement</h3>
          <p className="text-[#999999] mb-6">
            By using our service, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
            <br />
            If you have any questions about our privacy practices or how we handle your data, please don't hesitate to contact our support team.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="mailto:support.valorantchecker@gmail.com"
              className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-[#FF4655] hover:border-[#FF4655] transition-all font-heading uppercase text-sm tracking-widest cursor-pointer"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
