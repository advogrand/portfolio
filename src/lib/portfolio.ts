import { about, type AboutContent } from '../data/about';
import { contacts } from '../data/contacts';
import { projects, type Project } from '../data/projects';
import { supabase } from './supabase';

export type PortfolioProject = Project & { id: string };
export type PortfolioContent = {
  projects: PortfolioProject[];
  contacts: typeof contacts;
  about: AboutContent;
};

export const staticContent: PortfolioContent = {
  projects: projects.map((project, index) => ({ ...project, id: `static-${index + 1}` })),
  contacts,
  about,
};

function strings(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : fallback;
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!supabase) return staticContent;

  const [projectResult, contactResult, aboutResult] = await Promise.all([
    supabase.from('portfolio_projects').select('id, position, title, category, href, image_url').order('position'),
    supabase.from('portfolio_contacts').select('telegram_url, behance_url').eq('id', true).maybeSingle(),
    supabase.from('portfolio_about').select('title, paragraphs, facts').eq('id', true).maybeSingle(),
  ]);

  if (projectResult.error || contactResult.error || aboutResult.error) throw new Error('Supabase content is unavailable');

  return {
    projects: projectResult.data.map((project) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      href: project.href,
      image: project.image_url,
    })),
    contacts: contactResult.data ? { telegramUrl: contactResult.data.telegram_url, behanceUrl: contactResult.data.behance_url } : contacts,
    about: aboutResult.data
      ? { title: aboutResult.data.title, paragraphs: strings(aboutResult.data.paragraphs, about.paragraphs), facts: strings(aboutResult.data.facts, about.facts) }
      : about,
  };
}
