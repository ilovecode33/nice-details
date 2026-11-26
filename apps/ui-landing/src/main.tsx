import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AccentSwitcher,
  Button,
  DockNavigation,
  Select,
  Sheet,
  ThemeSwitcher,
  UIFoundation,
  useLocale,
} from '@ilovecode33/ui';
import type { DockNavigationHandle } from '@ilovecode33/ui-types';
import { ArrowRight } from 'lucide-react';
import '@ilovecode33/ui/styles.css';
import './app.css';
import { DICTIONARIES, LOCALES, LOCALE_NAMES, type Locale } from './i18n';
import { COMPONENT_GROUPS } from './component-groups';
import { LazyComponentDetails } from './lazy-component-details';
import { registerServiceWorker } from './register-sw';

registerServiceWorker();

function App() {
  const { locale, setLocale, t } = useLocale();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState(COMPONENT_GROUPS[0].id);
  const [heroInView, setHeroInView] = useState(true);
  const dockRef = useRef<DockNavigationHandle>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Track which component group is currently in view so the collapsed dock
  // can keep it centered.
  useEffect(() => {
    const onScroll = () => {
      let current = COMPONENT_GROUPS[0].id;
      for (const item of COMPONENT_GROUPS) {
        const section = document.getElementById(`group-${item.id}`);
        if (section && section.getBoundingClientRect().top <= 200) {
          current = item.id;
        }
      }
      setActiveGroup(current);
      // Keep the floating footer out of the fullscreen hero; restore it once
      // the component details are in view.
      const hero = heroRef.current;
      if (hero) setHeroInView(hero.getBoundingClientRect().bottom > window.innerHeight * 0.05);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToGroup = (id: string) => {
    setActiveGroup(id);
    document.getElementById(`group-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main id="top" className="landing__container">
        <section className="landing__hero" ref={heroRef} aria-labelledby="hero-title">
          <div className="landing__ambient" aria-hidden="true" />
          <div className="landing__hero-inner">
            <p className="landing__eyebrow">{t('hero.eyebrow')}</p>
            <h1 id="hero-title">{t('hero.title')}</h1>
            <p className="landing__hero-subtitle">{t('hero.subtitle')}</p>
            <p className="landing__lead">{t('hero.lead')}</p>
            <div className="landing__actions" data-ui="row">
              <Button variant="primary" icon={<ArrowRight />} onClick={() => setSheetOpen(true)}>
                {t('hero.ctaDemo')}
              </Button>
              <Button variant="secondary" onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('hero.ctaDetails')}
              </Button>
            </div>
            <div className="landing__preferences">
              <Select
                className="landing__locale"
                aria-label={t('language.label')}
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
                options={LOCALES.map((value) => ({ value, label: LOCALE_NAMES[value] }))}
              />
              <ThemeSwitcher
                labels={{
                  group: t('theme.group'),
                  system: t('theme.system'),
                  light: t('theme.light'),
                  dark: t('theme.dark'),
                }}
              />
              <AccentSwitcher
                labels={{
                  group: t('accent.group'),
                  warmth: t('accent.warmth'),
                  serenity: t('accent.serenity'),
                  growth: t('accent.growth'),
                  gentle: t('accent.gentle'),
                  vitality: t('accent.vitality'),
                }}
              />
            </div>
          </div>
        </section>

        <LazyComponentDetails
          onOpenIntro={() => setSheetOpen(true)}
          dockRef={dockRef}
          dockCollapsed={dockCollapsed}
        />
      </main>

      {/* Footer and navigation are one floating dock, hidden over the hero. */}
      {!heroInView && (
        <DockNavigation
          ref={dockRef}
          label={t('floating.footer')}
          items={COMPONENT_GROUPS.map((item) => ({
            id: item.id,
            label: t(item.title),
          }))}
          activeId={activeGroup}
          onSelect={goToGroup}
          collapsed={dockCollapsed}
          onCollapsedChange={setDockCollapsed}
          collapseLabel={t('floating.hideDemo')}
          expandLabel={t('floating.openDemo')}
        />
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('intro.title')}>
        <div data-ui="stack stack--md">
          <p>{t('intro.body')}</p>
          <Button variant="primary" block haloPortal onClick={() => setSheetOpen(false)}>{t('intro.gotIt')}</Button>
        </div>
      </Sheet>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIFoundation
      dictionaries={DICTIONARIES}
      localeStorageKey="ui-landing.locale"
    >
      <App />
    </UIFoundation>
  </StrictMode>,
);
