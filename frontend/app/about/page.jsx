export const metadata = { title: "Our story – Mandi Fresh" };

const steps = [
  ["6 am", "Our buyers reach the wholesale market and pick the day's best produce."],
  ["10 am", "Orders are packed in small batches. Dairy and meat stay chilled throughout."],
  ["12 pm", "Order cut-off for same-day delivery."],
  ["2 – 8 pm", "Riders deliver. You pay cash at the door."],
];

export default function AboutPage() {
  return (
    <div className="page-narrow max-w-4xl py-10 md:py-14 2xl:max-w-6xl 2xl:py-20">
      <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl 2xl:text-6xl">Our story</h1>
      <p className="mt-5 max-w-2xl text-base text-ink/70 sm:text-lg 2xl:max-w-3xl 2xl:text-xl">
        Mandi Fresh began when we got tired of choosing between supermarket prices and a weekend
        trip to the wholesale market. So we made the trip for everyone else.
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/about.jpg"
        alt="Vegetables displayed in baskets"
        className="mt-8 aspect-[4/3] w-full rounded-md object-cover sm:aspect-[16/8] md:mt-10"
      />

      <h2 className="mt-14 text-2xl font-semibold">A day with us</h2>
      <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {steps.map(([time, text]) => (
          <div key={time} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] 2xl:text-lg">
            <dt className="font-medium text-leaf">{time}</dt>
            <dd className="text-ink/70">{text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
