const services = [
  {
    name: "Consulting Call",
    description:
      "We learn about your project and give you a clear direction. One conversation, one concrete next step.",
  },
  {
    name: "Project Bootstrap",
    description:
      "We take you from idea to revenue. Zero to one in a matter of months.",
  },
  {
    name: "Team Embedding",
    description:
      "We join your team and work through complex architecture or product challenges alongside you.",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#08051a] w-full py-32 px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.3em] text-violet-400/60 uppercase mb-16">
          What we do
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.name}
              className="border border-white/10 rounded-2xl p-8 flex flex-col gap-4"
            >
              <h3 className="text-white font-light text-xl tracking-wide">
                {service.name}
              </h3>
              <p className="text-violet-200/50 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
