import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { Services } from './components/Services';
import { getPortfolioContent, staticContent } from './lib/portfolio';

export default function App() {
  const [content, setContent] = useState(staticContent);

  useEffect(() => {
    getPortfolioContent().then(setContent).catch(() => undefined);
  }, []);

  return (
    <>
      <main>
        <Hero />
        <Projects projects={content.projects} />
        <Services />
        <About about={content.about} />
        <Contact contacts={content.contacts} />
      </main>
      <Footer />
    </>
  );
}
import { useEffect, useState } from 'react';
