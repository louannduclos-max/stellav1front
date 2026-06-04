// Stella Project — Landing page (refonte conversion-directe)

const { TopNav, Footer, Arrow, Check, Pin, Spark, Sparkle, Section, SlideThumb, useRevealOnScroll } = window;

const CTA_LABEL = 'Créer ma première étude';
const CTA_SECONDARY = 'Voir un exemple d’étude';
const hasSupabaseSession = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('sb-') || !k.endsWith('-auth-token')) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.access_token) return true;
    }
  } catch (e) {}
  return false;
};
const goCreate = () => {
  // Le guard `_authenticated` redirige vers /login si nécessaire avec le bon
  // paramètre `redirect`. On envoie tout le monde directement au wizard.
  window.openStudyWizard();
};
const goExample = () => LouannStore.go('/example');

// Bleu corporate Stella — override scopé à la landing uniquement
const STELLA_THEME_CSS = `
.stella-landing {
  --red: #1E3A8A;
  --red-2: #0B2566;
  --red-3: #07194A;
  --red-soft: #EEF2FB;
  --red-soft-2: #DCE5F5;
  --red-grad: linear-gradient(135deg, #1E3A8A 0%, #0B2566 100%);
  --red-grad-soft: linear-gradient(135deg, #DCE5F5 0%, #EEF2FB 100%);
  --shadow-red: 0 8px 20px rgba(30, 58, 138, 0.22), 0 2px 6px rgba(30, 58, 138, 0.14);
}
.stella-landing .accent { color: var(--red); }
.stella-landing .pill-anchor { border-color: var(--red-soft-2); color: var(--red-2); background: var(--red-soft); }

.stella-landing .hero-inner { max-width: 1120px; }
.stella-landing .hero h1 { font-size: clamp(44px, 7vw, 84px); }
.stella-landing .hero-sub { max-width: 760px; font-size: 19px; }

.stella-landing { --shadow-red: 0 8px 20px rgba(30, 58, 138, 0.30), 0 2px 6px rgba(30, 58, 138, 0.18); }
.stella-landing .btn-primary:hover:not(:disabled) { box-shadow: 0 12px 28px rgba(30, 58, 138, 0.38); }

.stella-landing .hero { padding: 80px 0 32px; }
.stella-landing .hero + .section { padding-top: 40px; }
.stella-landing .hero-divider {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}
.stella-landing .hero-divider hr {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(30, 58, 138, 0.25), transparent);
  margin: 0;
}
.stella-landing .section-eyebrow {
  font-size: 18px;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
}

/* Steps timeline — Comment ça marche */
.stella-landing .stella-steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding-top: 16px;
}
.stella-landing .stella-steps::before {
  content: '';
  position: absolute;
  top: 46px;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg,
    rgba(30, 58, 138, 0.08),
    rgba(30, 58, 138, 0.45),
    rgba(30, 58, 138, 0.08));
  z-index: 0;
}
.stella-landing .stella-step {
  position: relative;
  text-align: center;
  padding: 0 12px;
  z-index: 1;
}
.stella-landing .stella-step-bubble {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #fff;
  background: linear-gradient(135deg, #1E3A8A, #2563EB);
  box-shadow: 0 10px 24px rgba(30, 58, 138, 0.35),
              0 0 0 6px rgba(255, 255, 255, 1),
              0 0 0 7px rgba(30, 58, 138, 0.12);
  transition: transform 0.25s ease;
}
.stella-landing .stella-step:hover .stella-step-bubble {
  transform: translateY(-3px) scale(1.04);
}
.stella-landing .stella-step h3 {
  font-size: 17px;
  margin: 0 0 8px;
  color: var(--ink-1);
}
.stella-landing .stella-step p {
  font-size: 14px;
  color: var(--ink-3);
  line-height: 1.55;
  margin: 0;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
}
@media (max-width: 820px) {
  .stella-landing .stella-steps { grid-template-columns: 1fr; gap: 28px; }
  .stella-landing .stella-steps::before {
    top: 0; bottom: 0; left: 31px; right: auto;
    width: 2px; height: auto;
    background: linear-gradient(180deg,
      rgba(30, 58, 138, 0.08),
      rgba(30, 58, 138, 0.45),
      rgba(30, 58, 138, 0.08));
  }
  .stella-landing .stella-step { text-align: left; padding-left: 84px; }
  .stella-landing .stella-step-bubble {
    position: absolute; left: 0; top: 0; margin: 0;
    width: 56px; height: 56px; font-size: 22px;
  }
  .stella-landing .stella-step p { margin: 0; max-width: none; }
}

.stella-pillars, .stella-usecases, .stella-benefits {
  display: grid; gap: 16px;
}
.stella-pillars { grid-template-columns: repeat(3, 1fr); }
.stella-usecases { grid-template-columns: repeat(3, 1fr); }
.stella-benefits { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 900px) {
  .stella-pillars, .stella-usecases, .stella-benefits { grid-template-columns: 1fr; }
}
.stella-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: transform .25s var(--ease-out), box-shadow .25s var(--ease-out), border-color .2s;
}
.stella-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--border-2); }
.stella-card h3 { margin: 8px 0 6px; font-size: 18px; }
.stella-card p { color: var(--ink-2); font-size: 14px; line-height: 1.55; margin: 0; }
.stella-card .ico {
  width: 40px; height: 40px; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--red-soft); color: var(--red);
}
.stella-card .mini-cta {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 14px; font-size: 13px; font-weight: 600;
  color: var(--red); cursor: pointer;
}
.stella-card .mini-cta:hover { color: var(--red-2); }

.stella-reassurance {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
@media (max-width: 900px) { .stella-reassurance { grid-template-columns: repeat(2, 1fr); } }
.stella-reassurance .item {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px;
  display: flex; align-items: flex-start; gap: 10px;
}
.stella-reassurance .item .ico {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--red-soft); color: var(--red);
}
.stella-reassurance .item strong { font-size: 14px; display: block; margin-bottom: 2px; }
.stella-reassurance .item span { font-size: 13px; color: var(--ink-3); }

.stella-faq { display: flex; flex-direction: column; gap: 10px; max-width: 820px; margin: 0 auto; }
.stella-faq details {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px 20px;
  transition: border-color .2s;
}
.stella-faq details[open] { border-color: var(--red-soft-2); box-shadow: var(--shadow-sm); }
.stella-faq summary {
  cursor: pointer; font-weight: 600; font-size: 15px; list-style: none;
  display: flex; justify-content: space-between; align-items: center;
}
.stella-faq summary::-webkit-details-marker { display: none; }
.stella-faq summary::after {
  content: '+'; font-size: 22px; color: var(--ink-3); line-height: 1; font-weight: 300;
}
.stella-faq details[open] summary::after { content: '−'; color: var(--red); }
.stella-faq p { margin: 12px 0 0; color: var(--ink-2); font-size: 14px; line-height: 1.6; }

.stella-mockup {
  margin-top: 36px; position: relative;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 18px;
  box-shadow: var(--shadow-lg);
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 14px;
}
@media (max-width: 800px) { .stella-mockup { grid-template-columns: 1fr; } }
.stella-mockup .panel {
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 16px; min-height: 240px;
}
.stella-mockup .panel-title { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-3); margin-bottom: 12px; }
.stella-mockup .row { display: flex; gap: 8px; margin-bottom: 8px; }
.stella-mockup .bar { height: 10px; border-radius: 4px; background: var(--ink-5); flex: 1; }
.stella-mockup .bar.s { flex: 0 0 40%; }
.stella-mockup .bar.accent { background: var(--red); }
.stella-mockup .chip { font-size: 11px; padding: 4px 8px; border-radius: 999px; background: var(--red-soft); color: var(--red-2); display: inline-block; margin-right: 6px; margin-bottom: 6px; font-weight: 600; }
.stella-mockup .kpi { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
.stella-mockup .kpi > div { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px; }
.stella-mockup .kpi strong { display: block; font-size: 18px; color: var(--red-2); font-family: 'Outfit', sans-serif; }
.stella-mockup .kpi small { color: var(--ink-3); font-size: 11px; }

.stella-sticky-cta {
  display: none;
}
@media (max-width: 760px) {
  .stella-sticky-cta {
    display: flex; position: fixed; bottom: 12px; left: 12px; right: 12px;
    z-index: 60; padding: 12px 16px; border-radius: 999px;
    background: var(--red-grad); color: #fff; font-weight: 600; font-size: 14px;
    box-shadow: var(--shadow-xl); align-items: center; justify-content: center; gap: 8px;
    border: none; cursor: pointer;
  }
}

.stella-trust { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 800px) { .stella-trust { grid-template-columns: repeat(2, 1fr); } }
.stella-trust .stat {
  text-align: center; padding: 24px 12px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
}
.stella-trust .stat strong {
  display: block; font-family: 'Outfit', sans-serif; font-size: 36px;
  background: var(--red-grad); -webkit-background-clip: text; background-clip: text; color: transparent;
  font-weight: 700;
}
.stella-trust .stat span { color: var(--ink-3); font-size: 13px; }

.stella-founder {
  display: grid; grid-template-columns: 200px 1fr; gap: 36px; align-items: center;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 36px;
  box-shadow: var(--shadow-sm);
}
@media (max-width: 760px) {
  .stella-founder { grid-template-columns: 1fr; text-align: center; gap: 20px; padding: 28px; }
  .stella-founder .photo { margin: 0 auto; }
}
.stella-founder .photo {
  width: 200px; height: 200px; border-radius: 50%;
  object-fit: cover; border: 4px solid var(--surface);
  box-shadow: var(--shadow-md);
}
.stella-founder h3 {
  margin: 0 0 12px; font-size: 22px;
}
.stella-founder p {
  margin: 0 0 12px; color: var(--ink-2); font-size: 15px; line-height: 1.65;
}
.stella-founder .signature {
  margin-top: 16px; font-size: 13px; color: var(--ink-3);
}
.stella-founder .signature strong { color: var(--ink); }
`;

function MicroReassure() {
  return (
    <div className="hero-meta">
      <span className="item"><span className="icon"><Check s={12} /></span> Sources vérifiées</span>
      <span className="item"><span className="icon"><Check s={12} /></span> Méthode approuvée</span>
      <span className="item"><span className="icon"><Check s={12} /></span> Livrable structuré</span>
    </div>
  );
}

function Landing() {
  useRevealOnScroll();

  return (
    <div className="fade-in stella-landing">
      <style>{STELLA_THEME_CSS}</style>
      <TopNav variant="landing" />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <span className="pill-anchor">
              <Sparkle s={13} /> Stella Project · Plateforme d’études B2B
            </span>
            <h1>
              La <span className="accent">force</span> d’un cabinet d’étude,<br/>
              la vitesse de l’<span className="accent">automatisation</span>.
            </h1>
            <p className="hero-sub">
              La plateforme Ouicare qui produit vos études de marché, concurrentielles,
              d’implantation et SAP avec la rigueur d’un cabinet et la vitesse d’une équipe automatisée.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={goCreate}>
                {CTA_LABEL} <Arrow />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={goExample}>
                {CTA_SECONDARY}
              </button>
            </div>
            <MicroReassure />
          </div>
        </div>
      </section>

      <div className="hero-divider"><hr /></div>

      {/* POURQUOI STELLA */}
      <Section
        eyebrow="Ce que vous apporte Stella"
        title="Des études fiables, livrées sans attendre."
      >
        <div className="stella-pillars">
          {[
            { ico: <Check s={20} />, t: 'Structure experte', d: 'Formulaires pensés comme un consultant : axes d’analyse, segmentation, KPI et logique métier pré-paramétrés. Chaque modèle est vérifié plusieurs fois avant sa mise en ligne pour garantir un livrable de qualité experte.' },
            { ico: <Spark s={20} />, t: 'Automatisation intelligente', d: 'Moins de friction, plus de vitesse d’exécution. Un parcours guidé qui supprime la page blanche.' },
            { ico: <Sparkle s={20} />, t: 'Livrables exploitables', d: 'Rendu structuré, réutilisable, présentable en interne comme face client. Pas un simple texte généré.' },
          ].map((p, i) => (
            <div key={i} className="stella-card reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
              <span className="ico">{p.ico}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* COMMENT ÇA MARCHE */}
      <Section
        title="Comment ça marche ?"
        sub="3 étapes pour produire une étude exploitable."
        sub="Un parcours guidé, sans friction, conçu pour démarrer immédiatement."
      >
        <div className="stella-steps">
          <div className="stella-step reveal">
            <div className="stella-step-bubble">1</div>
            <h3>Choisissez votre entreprise et votre type d’étude</h3>
            <p>Les presets de votre marque préparent automatiquement KPI, segmentations et axes d’analyse.</p>
          </div>
          <div className="stella-step reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="stella-step-bubble">2</div>
            <h3>Renseignez les informations clés</h3>
            <p>Formulaire expert : zone, secteur, cibles, palette et KPI. Pas de page blanche, pas de devinette.</p>
          </div>
          <div className="stella-step reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="stella-step-bubble">3</div>
            <h3>Lancez la génération</h3>
            <p>Obtenez un livrable PDF structuré, sourcé et prêt à présenter à votre comité ou à votre client.</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button className="btn btn-primary btn-lg" onClick={goCreate}>
            {CTA_LABEL} <Arrow />
          </button>
        </div>
      </Section>

      {/* QUI SUIS-JE */}
      <Section title="À propos">
        <div className="stella-founder reveal">
          <img src="/stella/founder.jpg" alt="Fondateur de Stella Project" className="photo" />
          <div>
            <h3>L’origine de Stella</h3>
            <p>
              Travaillant au sein du groupe <strong>Ouicare</strong>, en charge de l’expansion
              internationale. Sur le terrain, j’ai vu à quel point chaque demande d’étude de
              marché représentait un budget conséquent, des délais longs pour au final des
              études trop généralisées.
            </p>
            <p>
              C’est de cette frustration qu’est née <strong>Stella</strong> : une plateforme
              capable de produire des études structurées, rapidement et avec la rigueur d’un
              cabinet de recherche. Cette solution est spécialisée pour le secteur des
              <strong> services à la personne</strong>, où la complexité territoriale et
              démographique rend les études particulièrement précieuses, avant d’étendre
              progressivement à d’autres secteurs. Ici, c’est rapidité, personnalisation,
              fiabilité — et tout cela au moindre coût.
            </p>
            <p className="signature">
              <strong>Louann Duclos</strong> · Fondateur de Stella Project
            </p>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section title="Questions fréquentes">
        <div className="stella-faq">
          {[
            { q: 'Est-ce adapté à mon secteur ?', a: 'Oui. Stella est une solution développée pour Ouicare et ses marques : elle couvre marché, concurrence, implantation, économie territoriale et SAP. Les presets de votre marque adaptent automatiquement les KPI et axes à votre activité.' },
            { q: 'Puis-je l’utiliser pour des études SAP ?', a: 'Absolument. Le type d’étude SAP croise besoins, territoires, publics, concurrence, transport et contraintes opérationnelles spécifiques au secteur.' },
            { q: 'Dois-je tout configurer moi-même ?', a: 'Non. Votre administrateur configure un preset d’entreprise (KPI, cibles, axes). Les utilisateurs partent toujours d’une base pré-cochée par défaut.' },
            { q: 'Est-ce que le rendu est exploitable ?', a: 'Oui. Le livrable PDF est structuré, sourcé, et prêt à présenter en comité ou en rendez-vous client, sans retouche manuelle.' },
            { q: 'Combien de temps faut-il pour lancer une première étude ?', a: 'Quelques minutes. Le formulaire guidé en 5 étapes vous amène directement à la génération.' },
            { q: 'Est-ce compatible avec ma marque / mon entreprise ?', a: 'Oui. Charte graphique, logo, couleurs, vocabulaire et presets d’étude sont définis au niveau de votre marque.' },
          ].map((f, i) => (
            <details key={i}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Footer />

      {/* Sticky mobile CTA */}
      <button className="stella-sticky-cta" onClick={goCreate}>
        {CTA_LABEL} <Arrow />
      </button>
    </div>
  );
}

window.Landing = Landing;
