import { projects } from '../data/projects';

export function Projects() {
  return (
    <section className="section-shell projects" id="cases" aria-labelledby="cases-title">
      <div className="section-heading reveal">
        <p>КЕЙСЫ</p>
        <h2 id="cases-title">Избранные проекты</h2>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <a className="project-card reveal" href={project.href} target="_blank" rel="noreferrer noopener" key={project.title}>
            <img src={project.image} alt={`Обложка проекта: ${project.title}`} loading="lazy" width="1500" height="1000" />
            <span className="project-card__body">
              <span>
                <strong>{project.title}</strong>
                <small>{project.category}</small>
              </span>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
