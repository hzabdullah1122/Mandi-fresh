export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-2 2xl:min-h-[calc(100vh-5rem)] 2xl:grid-cols-[1.2fr_1fr]">
      <div className="relative hidden md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
        <p className="absolute bottom-10 left-10 max-w-xs font-serif text-2xl text-white lg:text-3xl 2xl:max-w-md 2xl:text-5xl">
          Fresh from the market, every morning.
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm 2xl:max-w-md">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
