import { contacts as initialContacts } from '../data/contacts';

type ContactProps = { contacts?: typeof initialContacts };

export function Contact({ contacts = initialContacts }: ContactProps) {
  return (
    <section className="section-shell contact reveal" id="contacts" aria-labelledby="contact-title">
      <p>ЕСТЬ ЗАДАЧА?</p>
      <h2 id="contact-title">Давайте обсудим проект</h2>
      <a className="primary-button" href={contacts.telegramUrl} target="_blank" rel="noreferrer noopener">
        Написать в Telegram
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M5 10h10m0 0-4-4m4 4-4 4" /></svg>
      </a>
      <div className="contact__links" aria-label="Контактные ссылки">
        <a href={contacts.telegramUrl} target="_blank" rel="noreferrer noopener">Telegram</a>
        <span>·</span>
        <a href={contacts.behanceUrl} target="_blank" rel="noreferrer noopener">Behance</a>
      </div>
    </section>
  );
}
