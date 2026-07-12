import { contacts } from '../data/contacts';

const navItems = [
  { label: 'Кейсы', href: '#cases' },
  { label: 'Услуги', href: '#services' },
  { label: 'Обо мне', href: '#about' },
  { label: 'Контакты', href: '#contacts' },
];

export function Header() {
  return (
    <header className="site-header">
      <a className="status" href="#contacts" aria-label="Перейти к контактам">
        <span aria-hidden="true" />
        Открыт к новым проектам
      </a>
      <nav className="nav" aria-label="Основная навигация">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <details className="mobile-menu">
        <summary>Меню</summary>
        <div>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href={contacts.telegramUrl} target="_blank" rel="noreferrer noopener">
            Написать в Telegram
          </a>
        </div>
      </details>
      <a
        className="header-cta"
        href={contacts.telegramUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Написать в Telegram"
      >
        Написать в Telegram
      </a>
    </header>
  );
}
