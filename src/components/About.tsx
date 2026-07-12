import { logos } from '../data/logos';

const facts = ['3+ года коммерческого опыта', 'Веб-студия · фриланс · агентство', 'Баннеры · презентации · сайты · дизайн-поддержка'];

export function About() {
  return (
    <section className="section-shell about" id="about" aria-labelledby="about-title">
      <div className="about__grid">
        <div className="section-heading reveal">
          <p>ОБО МНЕ</p>
          <h2 id="about-title">Работаю с дизайном как с системой</h2>
        </div>
        <div className="about__copy reveal">
          <p>Я Кирилл Алексеевец, digital-дизайнер с 3+ годами коммерческого опыта.</p>
          <p>
            Работал в веб-студии, на фрилансе и в креативном агентстве. Основной фокус — рекламные креативы,
            презентации, лендинги и дизайн-поддержка.
          </p>
          <p>
            Особенно хорошо работаю с уже существующими визуальными системами: развиваю их, адаптирую под новые задачи
            и сохраняю единый стиль во всех материалах.
          </p>
          <p>В работе ценю понятную коммуникацию, соблюдение договорённостей и внимание к задаче, а не только к внешнему виду.</p>
        </div>
      </div>

      <ul className="fact-list reveal" aria-label="Факты о работе">
        {facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>

      <div className="logo-block reveal">
        <p>Работал над проектами для</p>
        <ul>
          {logos.map((logo) => (
            <li key={logo.name}>
              <img src={logo.src} alt={logo.name} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
