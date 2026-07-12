import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { type AboutContent } from '../data/about';
import { getPortfolioContent, staticContent, type PortfolioContent, type PortfolioProject } from '../lib/portfolio';
import { supabase } from '../lib/supabase';

const draftKey = 'kirill-portfolio-admin-draft';
const isDatabaseId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

function loadLocalDraft(): PortfolioContent {
  try {
    const saved = localStorage.getItem(draftKey);
    return saved ? JSON.parse(saved) as PortfolioContent : staticContent;
  } catch {
    return staticContent;
  }
}

function imageUrl(path: string) {
  return path.startsWith('./') ? `../${path.slice(2)}` : path;
}

export function AdminApp() {
  const [draft, setDraft] = useState<PortfolioContent>(loadLocalDraft);
  const [section, setSection] = useState<'about' | 'projects' | 'contacts'>('projects');
  const [selectedId, setSelectedId] = useState(draft.projects[0]?.id ?? '');
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(!supabase);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [status, setStatus] = useState(supabase ? '' : 'Демо-режим: изменения хранятся только в этом браузере.');
  const [busy, setBusy] = useState(false);
  const selectedIndex = draft.projects.findIndex((project) => project.id === selectedId);
  const selectedProject = draft.projects[selectedIndex];

  useEffect(() => {
    if (!supabase) {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      return;
    }

    void refreshContent();
    void refreshSession();
  }, []);

  async function refreshContent() {
    try {
      const content = await getPortfolioContent();
      setDraft(content);
      setSelectedId(content.projects[0]?.id ?? '');
    } catch {
      setStatus('Не удалось загрузить данные из Supabase.');
    }
  }

  async function refreshSession() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (!data.session) return;

    const adminCheck = await supabase.rpc('is_portfolio_admin');
    let allowed = Boolean(adminCheck.data);
    if (!allowed) {
      const claim = await supabase.rpc('claim_portfolio_admin');
      allowed = Boolean(claim.data);
    }
    setIsAdmin(allowed);
  }

  function updateProject(changes: Partial<PortfolioProject>) {
    if (!selectedProject) return;
    setDraft((current) => ({ ...current, projects: current.projects.map((project) => project.id === selectedId ? { ...project, ...changes } : project) }));
  }

  function updateAbout(changes: Partial<AboutContent>) {
    setDraft((current) => ({ ...current, about: { ...current.about, ...changes } }));
  }

  function addProject() {
    const id = `new-${Date.now()}`;
    setDraft((current) => ({ ...current, projects: [...current.projects, { id, title: 'Новый кейс', category: 'Категория', href: 'https://', image: './images/cases/new-cover.jpg' }] }));
    setSelectedId(id);
  }

  function moveProject(direction: -1 | 1) {
    const nextIndex = selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= draft.projects.length) return;
    setDraft((current) => {
      const projects = [...current.projects];
      [projects[selectedIndex], projects[nextIndex]] = [projects[nextIndex], projects[selectedIndex]];
      return { ...current, projects };
    });
  }

  async function deleteProject() {
    if (!selectedProject || draft.projects.length === 1) return;
    if (supabase && isDatabaseId(selectedProject.id)) await supabase.from('portfolio_projects').delete().eq('id', selectedProject.id);
    const nextId = draft.projects[selectedIndex === draft.projects.length - 1 ? selectedIndex - 1 : selectedIndex + 1].id;
    setDraft((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== selectedId) }));
    setSelectedId(nextId);
  }

  async function saveDraft() {
    if (!supabase) {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setStatus('Черновик сохранён в браузере.');
      return;
    }

    setBusy(true);
    try {
      const rows = draft.projects.map((project, index) => ({
        ...(isDatabaseId(project.id) ? { id: project.id } : {}),
        position: index + 1,
        title: project.title,
        category: project.category,
        href: project.href,
        image_url: project.image,
      }));
      const projectSave = await supabase.from('portfolio_projects').upsert(rows).select();
      if (projectSave.error) throw projectSave.error;

      const contactSave = await supabase.from('portfolio_contacts').upsert({ id: true, telegram_url: draft.contacts.telegramUrl, behance_url: draft.contacts.behanceUrl });
      if (contactSave.error) throw contactSave.error;

      const aboutSave = await supabase.from('portfolio_about').upsert({ id: true, title: draft.about.title, paragraphs: draft.about.paragraphs, facts: draft.about.facts });
      if (aboutSave.error) throw aboutSave.error;

      await refreshContent();
      setStatus('Изменения опубликованы.');
    } catch {
      setStatus('Не удалось сохранить изменения.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadCover(file: File) {
    if (!supabase) return;
    setBusy(true);
    try {
      const name = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const upload = await supabase.storage.from('case-covers').upload(name, file, { upsert: false });
      if (upload.error) throw upload.error;
      updateProject({ image: supabase.storage.from('case-covers').getPublicUrl(upload.data.path).data.publicUrl });
      setStatus('Обложка загружена. Нажмите «Сохранить».');
    } catch {
      setStatus('Не удалось загрузить обложку.');
    } finally {
      setBusy(false);
    }
  }

  async function authenticate() {
    if (!supabase) return;
    setBusy(true);
    const response = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (response.error) return setStatus(response.error.message);
    if (isSignUp && !response.data.session) return setStatus('Проверьте почту и подтвердите регистрацию, затем войдите.');
    setStatus('Вход выполнен.');
    await refreshSession();
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setStatus('Вы вышли из админки.');
  }

  if (supabase && !session) {
    return (
      <main className="admin-page admin-auth-page">
        <section className="admin-auth">
          <a className="admin-brand" href="../">КИРИЛЛ АЛЕКСЕЕВЕЦ</a>
          <p>АДМИНКА</p><h1>{isSignUp ? 'Создать доступ' : 'Войти'}</h1>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="admin-button" type="button" onClick={authenticate} disabled={busy}>{isSignUp ? 'Зарегистрироваться' : 'Войти'}</button>
          <button className="admin-auth__switch" type="button" onClick={() => setIsSignUp((value) => !value)}>{isSignUp ? 'Уже есть доступ' : 'Создать доступ'}</button>
          <small>{status}</small>
        </section>
      </main>
    );
  }

  if (supabase && !isAdmin) {
    return <main className="admin-page admin-auth-page"><section className="admin-auth"><p>АДМИНКА</p><h1>Нет доступа</h1><small>Первый зарегистрированный пользователь получает права владельца. Если доступ уже создан, войдите под его email.</small><button className="admin-button" type="button" onClick={signOut}>Выйти</button></section></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-header"><a className="admin-brand" href="../">КИРИЛЛ АЛЕКСЕЕВЕЦ</a><div><span className="admin-status">{supabase ? 'Supabase подключён' : 'Демо-режим'}</span>{session && <button className="admin-logout" type="button" onClick={signOut}>Выйти</button>}<button className="admin-button" type="button" onClick={saveDraft} disabled={busy}>Сохранить</button></div></header>
      <div className="admin-layout">
        <aside className="admin-sidebar"><div className="admin-sidebar__heading"><div><p>КОНТЕНТ</p><h1>Админка</h1></div></div><nav className="admin-nav"><button className={section === 'about' ? 'is-selected' : ''} type="button" onClick={() => setSection('about')}>Обо мне</button><button className={section === 'projects' ? 'is-selected' : ''} type="button" onClick={() => setSection('projects')}>Кейсы</button><button className={section === 'contacts' ? 'is-selected' : ''} type="button" onClick={() => setSection('contacts')}>Контакты</button></nav><small className="admin-feedback">{status}</small></aside>
        <section className="admin-content">
          {section === 'projects' && selectedProject && <>
            <div className="admin-content__topline"><div><p>КЕЙСЫ</p><h2>Проекты</h2></div><button className="admin-button" type="button" onClick={addProject}>+ Добавить кейс</button></div>
            <div className="admin-case-tabs">{draft.projects.map((project, index) => <button className={project.id === selectedId ? 'is-selected' : ''} type="button" key={project.id} onClick={() => setSelectedId(project.id)}>{String(index + 1).padStart(2, '0')}</button>)}</div>
            <div className="admin-content__topline"><p>Кейс {selectedIndex + 1} из {draft.projects.length}</p><div className="admin-actions"><button type="button" onClick={() => moveProject(-1)} disabled={selectedIndex === 0}>Выше</button><button type="button" onClick={() => moveProject(1)} disabled={selectedIndex === draft.projects.length - 1}>Ниже</button><button className="admin-delete" type="button" onClick={deleteProject} disabled={draft.projects.length === 1}>Удалить</button></div></div>
            <h2>Редактирование кейса</h2><div className="admin-form-grid"><label>Название<input value={selectedProject.title} onChange={(event) => updateProject({ title: event.target.value })} /></label><label>Категория<input value={selectedProject.category} onChange={(event) => updateProject({ category: event.target.value })} /></label><label className="admin-form-grid__full">Ссылка на кейс<input type="url" value={selectedProject.href} onChange={(event) => updateProject({ href: event.target.value })} /></label><label className="admin-form-grid__full">Путь к обложке<input value={selectedProject.image} onChange={(event) => updateProject({ image: event.target.value })} /></label></div>
            <div className="admin-cover"><img src={imageUrl(selectedProject.image)} alt="Предпросмотр обложки кейса" /><div><p>Обложка 15:10</p><label className="admin-upload">Выбрать файл<input type="file" accept="image/avif,image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCover(file); }} /></label><small>{supabase ? 'Файл загрузится в Supabase Storage.' : 'Загрузка в Storage появится после подключения Supabase.'}</small></div></div>
          </>}
          {section === 'contacts' && <section className="admin-contacts admin-section"><p>КОНТАКТЫ</p><h2>Ссылки для сайта</h2><div className="admin-form-grid"><label>Telegram<input type="url" value={draft.contacts.telegramUrl} onChange={(event) => setDraft((current) => ({ ...current, contacts: { ...current.contacts, telegramUrl: event.target.value } }))} /></label><label>Behance<input type="url" value={draft.contacts.behanceUrl} onChange={(event) => setDraft((current) => ({ ...current, contacts: { ...current.contacts, behanceUrl: event.target.value } }))} /></label></div></section>}
          {section === 'about' && <section className="admin-contacts admin-section"><p>ОБО МНЕ</p><h2>Текст и факты</h2><div className="admin-form-grid"><label className="admin-form-grid__full">Заголовок<input value={draft.about.title} onChange={(event) => updateAbout({ title: event.target.value })} /></label>{draft.about.paragraphs.map((paragraph, index) => <label className="admin-form-grid__full" key={index}>Абзац {index + 1}<textarea rows={4} value={paragraph} onChange={(event) => updateAbout({ paragraphs: draft.about.paragraphs.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} /></label>)}{draft.about.facts.map((fact, index) => <label className="admin-form-grid__full" key={index}>Факт {index + 1}<input value={fact} onChange={(event) => updateAbout({ facts: draft.about.facts.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} /></label>)}</div></section>}
        </section>
      </div>
    </main>
  );
}
