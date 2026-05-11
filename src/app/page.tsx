import { HeroButton } from "@/components/LandingButtons";
import { Header } from "@/components/Header";

export default async function LandingPage() {

  return (
    <div className="min-h-screen bg-[#0F1923] text-[#ECE8E1] selection:bg-[#FF4655] selection:text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[#FF4655]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-[#FF4655]/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <Header showLandingButtons />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100-80px)] text-center px-4 pt-20 pb-32">
        <div className="relative inline-block mb-4">
          <span className="block text-[#FF4655] font-black tracking-[0.5em] uppercase text-sm mb-4 animate-pulse">
            Protocol: Access Granted
          </span>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 px-2">
            Track Your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF4655] to-[#ff7d87] px-2">
              Valorant Accounts
            </span>
          </h1>

          {/* Geometric lines */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-[#FF4655] hidden md:block" />
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-[#FF4655] hidden md:block" />
        </div>

        <p className="max-w-2xl text-lg text-[#ECE8E1]/60 mb-12 leading-relaxed">
          Check your daily store rotation, Night Market deals, collections, and detailed match history.
        </p>

        <HeroButton />

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full px-4">
          {[
            { title: "Daily Store", desc: "View your personal skin rotation without opening the game.", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
            { title: "Night Market", desc: "Reveal your limited-time discounts as soon as they drop.", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
            { title: "Collections", desc: "Track your owned skins and know which ones are missing.", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
            { title: "Match History", desc: "Analyze your performance, K/D ratio, and match outcomes.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 bg-white/5 border border-white/10 hover:border-[#FF4655]/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#FF4655]/10 flex items-center justify-center mb-6 group-hover:bg-[#FF4655] transition-colors">
                <svg className="w-6 h-6 text-[#FF4655] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold uppercase italic mb-3">{feature.title}</h3>
              <p className="text-[#ECE8E1]/50 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#FF4655]/50 to-transparent" />
    </div>
  );
}
