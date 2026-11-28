import { StrictMode, lazy, Suspense, useEffect, useRef, useState } from 'react';
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
import './app.css';
import { DICTIONARIES, LOCALES, LOCALE_NAMES, type Locale } from './i18n';
import { COMPONENT_GROUPS, componentDemoAnchor } from './component-groups';
import { LazyComponentDetails } from './lazy-component-details';
import { installScrollPersistence } from './scroll-restore';
import { registerServiceWorker } from './register-sw';
import type { ComponentReferenceProps } from './ComponentReference';

// The details chunk loads lazily, so the browser cannot restore the position
// reliably on its own. We restore it manually once the real section is mounted.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

registerServiceWorker();

const ComponentReference = lazy(() =>
  import('./ComponentReference').then((module) => ({ default: module.ComponentReference })),
);

function readReferenceFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('reference');
}

function App() {
  const { locale, setLocale, t } = useLocale();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [referenceName, setReferenceName] = useState(readReferenceFromUrl);
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

  // Persist the live scroll position on scroll and pagehide for the next load.
  useEffect(() => installScrollPersistence(), []);

  useEffect(() => {
    const onPopState = () => setReferenceName(readReferenceFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goToGroup = (id: string) => {
    setActiveGroup(id);
    document.getElementById(`group-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openReference = (name: string) => {
    window.history.pushState(null, '', `${window.location.pathname}?reference=${encodeURIComponent(name)}`);
    setReferenceName(name);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const selectReference = (name: string) => {
    window.history.replaceState(null, '', `${window.location.pathname}?reference=${encodeURIComponent(name)}`);
    setReferenceName(name);
  };

  const closeReference = () => {
    window.history.pushState(null, '', window.location.pathname);
    setReferenceName(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const viewComponentExample = (name: string) => {
    const anchor = componentDemoAnchor(name);
    window.history.pushState(null, '', `${window.location.pathname}#${anchor}`);
    setReferenceName(null);
    let attempts = 0;
    const scrollWhenReady = () => {
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (attempts++ < 60) window.setTimeout(scrollWhenReady, 100);
    };
    window.setTimeout(scrollWhenReady, 0);
  };

  return (
    <>
      <main id="top" className="landing__container">
        {referenceName ? (
          <Suspense fallback={<div className="landing__section" aria-busy="true">{t('reference.title')}</div>}>
            <ComponentReference
              selectedName={referenceName}
              t={t as ComponentReferenceProps['t']}
              onClose={closeReference}
              onSelect={selectReference}
              onViewExample={viewComponentExample}
            />
          </Suspense>
        ) : (
          <>
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
              <Button variant="plain" onClick={() => openReference('TextInput')}>
                {t('hero.ctaReference')}
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
          onOpenReference={openReference}
          dockRef={dockRef}
          dockCollapsed={dockCollapsed}
        />
          </>
        )}
      </main>

      {/* Footer and navigation are one floating dock, hidden over the hero. */}
      {!referenceName && !heroInView && (
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
