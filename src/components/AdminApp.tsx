import { useEffect, useMemo, useState } from 'react';
import { contacts as initialContacts } from '../data/contacts';
import { projects as initialProjects, type Project } from '../data/projects';

type AdminProject = Project & { id: string };
type AboutContent = {
  title: string;
  paragraphs: string[];
  facts: string[];
};
type Draft = {
  projects: AdminProject[];
  contacts: typeof initialContacts;
  about: AboutContent;
};

const draftKey = 'kirill-portfolio-admin-draft';
const initialAbout: AboutContent = {
  title: 'Работаю с дизайном как с системой',
  paragraphs: [
    'Я Кирилл Алексеевец, digital-дизайнер с 3+ годами коммерческого опыта.',
    'Работал в веб-студии, на фрилансе и в креативном агентстве. Основной фокус — рекламные креативы, презентации, лендинги и дизайн-поддержка.',
    'Особенно хорошо работаю с уже существующими визуальными системами: развиваю их, адаптирую под новые задачи и сохраняю единый стиль во всех материалах.',
    'В работе ценю понятную коммуникацию, соблюдение договорённостей и внимание к задаче, а не только к внешнему виду.',
  ],
  facts: [
    '3+ года коммерческого опыта',
    'Веб-студия · фриланс · агентство',
    'Баннеры · презентации · сайты · дизайн-поддержка',
  ],
};

function createDraft(): Draft {
  return {
    projects: initialProjects.map((project, index) => ({ ...project, id: `project-${index + 1}` })),
    contacts: { ...initialContacts },
    about: { ...initialAbout, paragraphs: [...initialAbout.paragraphs], facts: [...initialAbout.facts] },
  };
}

function loadDraft(): Draft {
  try {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return createDraft();

    const draft = JSON.parse(saved) as Partial<Draft>;
    if (!Array.isArray(draft.projects) || !draft.contacts) return createDraft();

    return {
      ...createDraft(),
      ...draft,
      contacts: { ...initialContacts, ...draft.contacts },
      about: {
        ...initialAbout,
        ...draft.about,
        paragraphs: draft.about?.paragraphs ?? initialAbout.paragraphs,
        facts: draft.about?.facts ?? initialAbout.facts,
      },
    } as Draft;
  } catch {
    return createDraft();
  }
}

function imageUrl(path: string) {
  return path.startsWith('./') ? `../${path.slice(2)}` : path;
}

export function AdminApp() {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [activeSection, setActiveSection] = useState<'about' | 'projects' | 'contacts'>('projects');
  const [selectedId, setSelectedId] = useState(draft.projects[0]?.id ?? '');
  const [selectedFile, setSelectedFile] = useState('');
  const selectedIndex = draft.projects.findIndex((project) => project.id === selectedId);
  const selectedProject = draft.projects[selectedIndex];
  const caseLabel = useMemo(
    () => (selectedIndex >= 0 ? `Кейс ${selectedIndex + 1} из ${draft.projects.length}` : 'Новый кейс'),
    [draft.projects.length, selectedIndex],
  );

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft]);

  function updateProject(changes: Partial<Project>) {
    if (!selectedProject) return;
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project) => (project.id === selectedId ? { ...project, ...changes } : project)),
    }));
  }

  function addProject() {
    const id = `project-${Date.now()}`;
    setDraft((current) => ({
      ...current,
      projects: [
        ...current.projects,
        { id, title: 'Новый кейс', category: 'Категория', href: 'https://', image: './images/cases/new-cover.jpg' },
      ],
    }));
    setSelectedId(id);
  }

  function moveProject(direction: -1 | 1) {
    const nextIndex = selectedIndex + direction;
    if (selectedIndex < 0 || nextIndex < 0 || nextIndex >= draft.projects.length) return;

    setDraft((current) => {
      const projects = [...current.projects];
      [projects[selectedIndex], projects[nextIndex]] = [projects[nextIndex], projects[selectedIndex]];
      return { ...current, projects };
    });
  }

  function deleteProject() {
    if (!selectedProject || draft.projects.length === 1) return;
    const nextId = draft.projects[selectedIndex === draft.projects.length - 1 ? selectedIndex - 1 : selectedIndex + 1].id;
    setDraft((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== selectedId) }));
    setSelectedId(nextId);
  }

  function resetDraft() {
    const nextDraft = createDraft();
    localStorage.removeItem(draftKey);
    setDraft(nextDraft);
    setSelectedId(nextDraft.projects[0].id);
    setSelectedFile('');
  }

  function updateAbout(changes: Partial<AboutContent>) {
    setDraft((current) => ({ ...current, about: { ...current.about, ...changes } }));
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="admin-brand" href="../">КИРИЛЛ АЛЕКСЕЕВЕЦ</a>
        <div>
          <span className="admin-status">Демо-режим</span>
          <a className="admin-site-link" href="../">Открыть сайт</a>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Навигация админки">
          <div className="admin-sidebar__heading">
            <div>
              <p>КОНТЕНТ</p>
              <h1>Админка</h1>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Разделы контента">
            <button className={activeSection === 'about' ? 'is-selected' : ''} type="button" onClick={() => setActiveSection('about')}>Обо мне</button>
            <button className={activeSection === 'projects' ? 'is-selected' : ''} type="button" onClick={() => setActiveSection('projects')}>Кейсы</button>
            <button className={activeSection === 'contacts' ? 'is-selected' : ''} type="button" onClick={() => setActiveSection('contacts')}>Контакты</button>
          </nav>

          <button className="admin-reset" type="button" onClick={resetDraft}>Сбросить черновик</button>
        </aside>

        <section className="admin-content">
          {activeSection === 'projects' && selectedProject && (
            <>
              <div className="admin-content__topline">
                <div>
                  <p>КЕЙСЫ</p>
                  <h2>Проекты</h2>
                </div>
                <button className="admin-button" type="button" onClick={addProject}>+ Добавить кейс</button>
              </div>

              <div className="admin-case-tabs" aria-label="Кейсы">
                {draft.projects.map((project, index) => (
                  <button
                    className={project.id === selectedId ? 'is-selected' : ''}
                    type="button"
                    key={project.id}
                    onClick={() => {
                      setSelectedId(project.id);
                      setSelectedFile('');
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>

              <div className="admin-content__topline">
                <p>{caseLabel}</p>
                <div className="admin-actions">
                  <button type="button" onClick={() => moveProject(-1)} disabled={selectedIndex === 0}>Выше</button>
                  <button type="button" onClick={() => moveProject(1)} disabled={selectedIndex === draft.projects.length - 1}>Ниже</button>
                  <button type="button" className="admin-delete" onClick={deleteProject} disabled={draft.projects.length === 1}>Удалить</button>
                </div>
              </div>

              <h2 id="case-editor-title">Редактирование кейса</h2>

              <div className="admin-form-grid">
                <label>
                  Название
                  <input value={selectedProject.title} onChange={(event) => updateProject({ title: event.target.value })} />
                </label>
                <label>
                  Категория
                  <input value={selectedProject.category} onChange={(event) => updateProject({ category: event.target.value })} />
                </label>
                <label className="admin-form-grid__full">
                  Ссылка на кейс
                  <input type="url" value={selectedProject.href} onChange={(event) => updateProject({ href: event.target.value })} />
                </label>
                <label className="admin-form-grid__full">
                  Путь к обложке
                  <input value={selectedProject.image} onChange={(event) => updateProject({ image: event.target.value })} />
                </label>
              </div>

              <div className="admin-cover">
                <img src={imageUrl(selectedProject.image)} alt="Предпросмотр обложки кейса" />
                <div>
                  <p>Обложка 15:10</p>
                  <label className="admin-upload">
                    Выбрать файл
                    <input
                      type="file"
                      accept="image/avif,image/jpeg,image/png,image/webp"
                      onChange={(event) => setSelectedFile(event.target.files?.[0]?.name ?? '')}
                    />
                  </label>
                  <small>{selectedFile ? `Выбран файл: ${selectedFile}` : 'Загрузка в Storage появится после подключения Supabase.'}</small>
                </div>
              </div>
            </>
          )}

          {activeSection === 'contacts' && <section className="admin-contacts admin-section" aria-labelledby="contacts-editor-title">
            <p>КОНТАКТЫ</p>
            <h2 id="contacts-editor-title">Ссылки для сайта</h2>
            <div className="admin-form-grid">
              <label>
                Telegram
                <input
                  type="url"
                  value={draft.contacts.telegramUrl}
                  onChange={(event) => setDraft((current) => ({ ...current, contacts: { ...current.contacts, telegramUrl: event.target.value } }))}
                />
              </label>
              <label>
                Behance
                <input
                  type="url"
                  value={draft.contacts.behanceUrl}
                  onChange={(event) => setDraft((current) => ({ ...current, contacts: { ...current.contacts, behanceUrl: event.target.value } }))}
                />
              </label>
            </div>
          </section>}

          {activeSection === 'about' && <section className="admin-contacts admin-section" aria-labelledby="about-editor-title">
            <p>ОБО МНЕ</p>
            <h2 id="about-editor-title">Текст и факты</h2>
            <div className="admin-form-grid">
              <label className="admin-form-grid__full">
                Заголовок
                <input value={draft.about.title} onChange={(event) => updateAbout({ title: event.target.value })} />
              </label>
              {draft.about.paragraphs.map((paragraph, index) => (
                <label className="admin-form-grid__full" key={`paragraph-${index + 1}`}>
                  Абзац {index + 1}
                  <textarea
                    rows={4}
                    value={paragraph}
                    onChange={(event) => updateAbout({ paragraphs: draft.about.paragraphs.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })}
                  />
                </label>
              ))}
              {draft.about.facts.map((fact, index) => (
                <label className="admin-form-grid__full" key={`fact-${index + 1}`}>
                  Факт {index + 1}
                  <input
                    value={fact}
                    onChange={(event) => updateAbout({ facts: draft.about.facts.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })}
                  />
                </label>
              ))}
            </div>
          </section>}
        </section>
      </div>
    </main>
  );
}
