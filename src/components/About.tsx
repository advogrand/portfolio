import { about as initialAbout, type AboutContent } from '../data/about';
import { logos } from '../data/logos';

type AboutProps = { about?: AboutContent };

export function About({ about = initialAbout }: AboutProps) {
  return (
    <section className="section-shell about" id="about" aria-labelledby="about-title">
      <div className="about__grid">
        <div className="section-heading reveal">
          <p>ОБО МНЕ</p>
          <h2 id="about-title">{about.title}</h2>
        </div>
        <div className="about__copy reveal">
          {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
      <ul className="fact-list reveal" aria-label="Факты о работе">
        {about.facts.map((fact) => <li key={fact}>{fact}</li>)}
      </ul>
      <div className="logo-block reveal">
        <p>Работал над проектами для</p>
        <ul>{logos.map((logo) => <li key={logo.name}><img src={logo.src} alt={logo.name} loading="lazy" /></li>)}</ul>
      </div>
    </section>
  );
}
