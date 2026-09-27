import Link from "next/link";
import { ArrowUpRight, ChefHat, Check, MessageCircle, QrCode, UtensilsCrossed } from "lucide-react";

const features = [
  { icon: UtensilsCrossed, title: "A menu that feels like you", description: "Bring your meals, drinks and daily favourites together in one digital menu." },
  { icon: QrCode, title: "One link. Every table.", description: "Share your menu online or let guests scan a QR code and start exploring." },
  { icon: MessageCircle, title: "Straight to WhatsApp", description: "Guests fill their cart and send their order to your restaurant on WhatsApp." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#242522]">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-7">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold" aria-label="QuickMenu home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f47746] text-white"><ChefHat size={22} /></span>
          QuickMenu<span className="text-[#bb4824]">.</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-7 text-sm">
          <a href="#how-it-works" className="hidden hover:text-[#bb4824] sm:block">How it works</a>
          <Link href="/demo-restaurant" className="flex items-center gap-1.5 hover:text-[#bb4824]">Explore the demo <ArrowUpRight size={16} /></Link>
        </nav>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-5 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-[#686962]"><span className="h-2 w-2 rounded-full bg-[#f47746]" />Made for good food</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">Your menu.<br /><span className="text-[#bb4824]">Freshly digital.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#686962]">Great food deserves a great first impression. Give your guests a simple way to browse, choose and order on WhatsApp.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#bb4824] px-5 py-3 font-medium text-white transition-colors duration-150 hover:bg-[#a13c1d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bb4824] active:bg-[#873219] motion-reduce:transition-none"
            >
              Create menu
            </Link>
            <Link
              href="/demo-restaurant"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-5 py-3 font-medium text-white transition-colors duration-150 hover:bg-[#292929] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black active:bg-[#404040] motion-reduce:transition-none"
            >
              View demo menu
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-[#686962]"><Check size={16} className="text-[#bb4824]" />Easy to share. Easy to order.</p>
        </div>
        <div className="relative isolate mx-auto flex w-full max-w-md justify-center px-5 py-8">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-12 top-12 -z-10 rounded-[50%] bg-[#f47746]" />
          <div aria-hidden="true" className="absolute inset-x-3 bottom-9 top-9 -z-10 rotate-[-12deg] rounded-[50%] border border-[#e5b69e]" />
          <div className="w-full max-w-[290px] rotate-[-3deg] rounded-[36px] border-[7px] border-[#242522] bg-white p-4 shadow-[0_24px_60px_-25px_rgba(36,37,34,0.45)]">
            <div aria-hidden="true" className="mx-auto mb-5 h-4 w-20 rounded-full bg-[#242522]" />
            <div className="rounded-2xl bg-[#fff0e8] p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#a64120]">Welcome to your table</p>
              <h2 className="mt-2 text-2xl font-semibold">Something<br />delicious awaits.</h2>
              <p className="mt-2 text-xs text-[#686962]">Fresh meals, drinks & good company.</p>
            </div>
            <div className="mb-3 mt-5 flex items-center justify-between"><h3 className="text-sm font-semibold">On the menu</h3><span className="text-[10px] text-[#686962]">Demo restaurant</span></div>
            <div className="rounded-2xl bg-[#f8f7f4] p-4">
              <div aria-hidden="true" className="flex h-24 items-center justify-center rounded-xl bg-[#f3e4d2] text-7xl">🍛</div>
              <div className="mt-3 flex items-center justify-between gap-2 text-sm font-semibold"><span>Jollof Rice</span><span className="text-[#a64120]">GHS 65</span></div>
              <p className="mt-1 text-xs leading-5 text-[#686962]">Served with grilled chicken.</p>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#eeece7] p-3"><span aria-hidden="true" className="text-3xl">🍍</span><div><p className="text-xs font-semibold">Fresh Pineapple Juice</p><p className="mt-1 text-xs text-[#a64120]">GHS 20</p></div></div>
            <p className="pb-1 pt-4 text-center text-[10px] uppercase tracking-[0.18em] text-[#686962]">A little taste of your digital menu</p>
          </div>
          <div className="absolute -right-1 bottom-20 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg sm:-right-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0e8] text-[#a64120]"><Check size={18} /></span><span className="text-xs font-semibold">Good food. Just a scan away.</span></div>
        </div>
      </section>
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-8 px-6 pb-16">
        <div className="rounded-3xl bg-[#242522] px-7 py-10 text-white md:px-10 md:py-12">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end"><h2 className="text-3xl font-semibold leading-tight">Less friction.<br /><span className="text-[#ff956b]">More flavour.</span></h2><p className="max-w-sm text-sm leading-6 text-[#c6c7c1]">From the first look to the final order, make every step feel effortless.</p></div>
          <div className="grid gap-8 md:grid-cols-3">{features.map(({ icon: Icon, title, description }) => <div key={title} className="border-t border-white/15 pt-6"><Icon size={24} className="mb-4 text-[#ff956b]" /><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#c6c7c1]">{description}</p></div>)}</div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 pb-8 text-xs text-[#686962]"><p>QuickMenu — good food starts here.</p><p>Digital menus · Restaurant dashboards · WhatsApp ordering</p></footer>
    </main>
  );
}
