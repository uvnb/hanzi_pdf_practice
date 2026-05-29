interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
  badge?: string;
}

interface PricingSectionProps {
  title: string;
  tiers: PricingTier[];
}

export default function PricingSection({ title, tiers }: PricingSectionProps) {
  return (
    <section className="pricingSection" id="pricing">
      <h2 className="pricingTitle">{title}</h2>

      <div className="pricingGrid">
        {tiers.map((tier) => (
          <article
            className={`pricingCard${tier.popular ? " popular" : ""}`}
            key={tier.name}
          >
            {tier.badge ? (
              <span className="pricingBadge">{tier.badge}</span>
            ) : null}

            <p className="pricingTier">{tier.name}</p>
            <p className="pricingAmount">
              {tier.price}
              {tier.period ? <span>/{tier.period}</span> : null}
            </p>

            <ul className="pricingFeatures">
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <button className="pricingCta" type="button">
              {tier.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
