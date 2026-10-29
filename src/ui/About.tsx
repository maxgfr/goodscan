/** How the score works, where the data comes from, under which licences. */
import { PageTitle, Section } from "./kit";
import { useApp } from "./state";

export function About() {
  const { t } = useApp();
  return (
    <>
      <PageTitle title={t("aboutTitle")} subtitle={t("appTagline")} />
      <div className="grid gap-4">
        <section className="card">
          <p className="text-sm leading-relaxed text-soft">{t("aboutBody")}</p>
        </section>
        <Section title={t("aboutScoreTitle")}>
          <ol className="grid list-decimal gap-1.5 pl-5 text-sm leading-relaxed text-soft">
            {(
              ["aboutScore1", "aboutScore2", "aboutScore3", "aboutScore4", "aboutScore5"] as const
            ).map((k) => (
              <li key={k}>{t(k)}</li>
            ))}
          </ol>
        </Section>
        <Section title={t("aboutSourcesTitle")}>
          <ul className="grid gap-2 text-sm leading-relaxed text-soft">
            <li>
              {t("aboutOff")}{" "}
              <a
                className="underline"
                href="https://world.openfoodfacts.org/terms-of-use"
                target="_blank"
                rel="noreferrer"
              >
                openfoodfacts.org
              </a>
            </li>
            <li>{t("aboutEfsa")}</li>
            <li>{t("aboutFda")}</li>
            <li className="font-medium">{t("aboutNotAdvice")}</li>
            <li>
              <a
                className="underline"
                href="https://github.com/maxgfr/goodscan"
                target="_blank"
                rel="noreferrer"
              >
                {t("aboutCode")}
              </a>
            </li>
          </ul>
        </Section>
      </div>
    </>
  );
}
