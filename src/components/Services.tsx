import { services } from '../data/services';

export function Services() {
  return (
    <section className="section-shell services" id="services" aria-labelledby="services-title">
      <div className="section-heading reveal">
        <p>УСЛУГИ</p>
        <h2 id="services-title">Дизайн для digital-задач</h2>
      </div>
      <p className="section-lead reveal">
        Помогаю бизнесу создавать и развивать рекламные, презентационные и веб-материалы в рамках цельной визуальной системы.
      </p>

      <div className="service-list">
        {services.map((service, index) => (
          <article className="service-row reveal" key={service.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
            <small>{service.tags}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
