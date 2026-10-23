import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const shop = [
  ["Fruits", "/products?category=Fruits"],
  ["Vegetables", "/products?category=Vegetables"],
  ["Dairy & eggs", "/products?category=Dairy"],
  ["Bakery", "/products?category=Bakery"],
  ["Meat", "/products?category=Meat"],
  ["Pantry", "/products?category=Pantry"],
];

const company = [
  ["Our story", "/about"],
  ["Contact us", "/contact"],
  ["Log in", "/login"],
  ["Create account", "/register"],
];

const socials = ["Instagram", "Facebook", "WhatsApp"];

const colTitle = "text-xs font-medium uppercase tracking-widest text-white/50";
const colLink = "text-white/80 transition hover:text-white";

export default function Footer() {
  return (
    <footer className="mt-24 overflow-hidden bg-leaf-dark text-white 2xl:mt-32">
      {/* Newsletter band */}
      <div className="border-b border-white/15">
        <div className="container-x flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between 2xl:py-14">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl 2xl:text-4xl">Fresh deals, once a week.</h2>
            <p className="mt-2 max-w-md text-sm text-white/70 2xl:text-base">
              Seasonal produce, price drops and new arrivals. No spam, unsubscribe any time.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-12 text-sm md:grid-cols-4 lg:grid-cols-6 2xl:py-16 2xl:text-base">
        <div className="col-span-2 lg:col-span-2">
          <p className="font-serif text-2xl font-semibold 2xl:text-3xl">
            Mandi<span className="text-[#a8d5b0]">Fresh</span>
          </p>
          <p className="mt-3 max-w-xs text-white/70">
            We buy from the wholesale market every morning and deliver to your door by evening.
          </p>
          {/* <div className="mt-5 flex gap-4">
            {socials.map((s) => (
              <a key={s} href="#" className="text-white/70 underline-offset-4 transition hover:text-white hover:underline">
                {s}
              </a>
            ))}
          </div> */}
        </div>

        <div>
          <p className={colTitle}>Shop</p>
          <ul className="mt-4 space-y-2.5">
            {shop.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className={colLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={colTitle}>Company</p>
          <ul className="mt-4 space-y-2.5">
            {company.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className={colLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-2 lg:col-span-2">
          <p className={colTitle}>Get in touch</p>
          <ul className="mt-4 space-y-2.5 text-white/80">
            <li>hello@mandifresh.example</li>
            <li>+92 313 5225423</li>
            <li>Mon – Sat, 9am to 9pm</li>
            <li className="pt-2 text-white/60">Delivering across Lahore: Johar Town, Gulberg, Model Town, Wapda Town and more.</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/15">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row 2xl:text-sm">
          <p>© {new Date().getFullYear()} Mandi Fresh. All right reserved by Abdullah.</p>
          <p>Cash on delivery &nbsp;·&nbsp; Same-day delivery &nbsp;·&nbsp; Free above Rs. 2,000</p>
        </div>
      </div>
    </footer>
  );
}
