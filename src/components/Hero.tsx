import { Header } from './Header';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Header />
      <div className="hero__stage">
        <div className="hero__meta reveal">
          <img src="./images/portrait/kirill.webp" width="88" height="88" alt="Кирилл Алексеевец" />
          <div>
            <p>Кирилл Алексеевец</p>
            <span>Digital-дизайнер</span>
          </div>
        </div>

        <div className="hero__content reveal">
          <h1 id="hero-title">
            СОЗДАЮ <span className="hero__accent">DIGITAL-ДИЗАЙН</span>, КОТОРЫЙ ПОМОГАЕТ БИЗНЕСУ ВЫГЛЯДЕТЬ УБЕДИТЕЛЬНО
          </h1>
          <p>
            Рекламные креативы, лендинги, презентации
            <br />и дизайн-поддержка для компаний и команд.
          </p>
          <a className="primary-button" href="#cases">
            Смотреть кейсы
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="M5 10h10m0 0-4-4m4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
