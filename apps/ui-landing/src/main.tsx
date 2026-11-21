import { StrictMode, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AccentProvider,
  AccentSwitcher,
  Button,
  Card,
  EmptyState,
  Field,
  Segmented,
  Select,
  Sheet,
  SliderRow,
  Stat,
  StatusStat,
  Switch,
  TextInput,
  ThemeProvider,
  ThemeSwitcher,
} from '@ilovecode33/ui';
import '@ilovecode33/ui/styles.css';
import './app.css';
import {
  LOCALES,
  LOCALE_NAMES,
  useI18n,
  type Locale,
  type TranslationKey,
} from './i18n';

type Filter = 'all' | 'active' | 'archived';
type Tone = 'warm' | 'ocean' | 'forest' | 'violet' | 'citrus';

const TONES: Array<{ value: Tone; color: string; key: TranslationKey }> = [
  { value: 'warm', color: '#b23a0a', key: 'tone.warm' },
  { value: 'ocean', color: '#1565c0', key: 'tone.ocean' },
  { value: 'forest', color: '#2e7d32', key: 'tone.forest' },
  { value: 'violet', color: '#6a1b9a', key: 'tone.violet' },
  { value: 'citrus', color: '#8a9a00', key: 'tone.citrus' },
];

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="landing__section">
      <h2>{title}</h2>
      {subtitle && <p className="landing__subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}

function App() {
  const { locale, setLocale, t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [backup, setBackup] = useState(true);
  const [quality, setQuality] = useState(75);
  const [albumName, setAlbumName] = useState('');
  const [tone, setTone] = useState<Tone>('warm');
  const [introOpen, setIntroOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedTone = TONES.find((item) => item.value === tone) ?? TONES[0];

  return (
    <>
      <header className="landing__header">
        <div className="landing__container landing__header-inner">
          <a className="landing__brand" href="#top">
            <span className="landing__brand-mark">✦</span> @ilovecode33/ui
          </a>
          <div className="landing__header-actions">
            <Select
              className="landing__locale"
              aria-label={t('language.label')}
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              options={LOCALES.map((value) => ({
                value,
                label: LOCALE_NAMES[value],
              }))}
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
      </header>

      <main id="top" className="landing__container">
        <section className="landing__hero">
          <p className="landing__eyebrow">{t('hero.eyebrow')}</p>
          <h1>
            {t('hero.title')}
            <br />
            {t('hero.subtitle')}
          </h1>
          <p className="landing__lead">{t('hero.lead')}</p>
          <div className="ui-row">
            <Button variant="primary" icon="→" onClick={() => setIntroOpen(true)}>
              {t('hero.ctaDemo')}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                document
                  .getElementById('details')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {t('hero.ctaDetails')}
            </Button>
          </div>
        </section>

        <Section
          id="details"
          title={t('details.title')}
          subtitle={t('details.subtitle')}
        >
          <div className="ui-stack ui-stack--lg">
            <Card
              title={t('upload.title')}
              subtitle={t('upload.subtitle')}
              actions={
                <Button variant="plain" size="compact">
                  {t('upload.history')}
                </Button>
              }
            >
              <div className="ui-stack ui-stack--md">
                <div className="ui-stat-grid">
                  <Stat label={t('upload.albums')} value={12} tone="accent" />
                  <StatusStat
                    label={t('upload.success')}
                    value={24}
                    status="success"
                  />
                  <StatusStat
                    label={t('upload.failed')}
                    value={2}
                    status="danger"
                  />
                </div>
                <div className="ui-row">
                  <Button variant="secondary" icon="↻">
                    {t('upload.retry')}
                  </Button>
                  <Button variant="primary" icon="＋">
                    {t('upload.continue')}
                  </Button>
                </div>
              </div>
            </Card>

            <Card title={t('settings.title')} subtitle={t('settings.subtitle')}>
              <div className="ui-stack ui-stack--lg">
                <Field label={t('settings.name')} hint={t('settings.nameHint')}>
                  <TextInput
                    value={albumName}
                    placeholder={t('settings.namePlaceholder')}
                    onChange={(event) => setAlbumName(event.target.value)}
                  />
                </Field>
                <Field label={t('settings.sort')}>
                  <Select
                    defaultValue="newest"
                    options={[
                      { value: 'newest', label: t('settings.newest') },
                      { value: 'oldest', label: t('settings.oldest') },
                      { value: 'name', label: t('settings.byName') },
                    ]}
                  />
                </Field>
                <Field label={t('settings.tone')} hint={t('settings.toneHint')}>
                  <Select<Tone>
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    options={TONES.map((item) => ({
                      value: item.value,
                      label: t(item.key),
                      leading: (
                        <span
                          className="ui-color-swatch"
                          style={{ background: item.color }}
                        />
                      ),
                    }))}
                  />
                </Field>
                <p className="landing__tone-preview">
                  {t('settings.toneCurrent')}
                  <span
                    className="ui-color-swatch"
                    style={{ background: selectedTone.color }}
                  />
                  {t(selectedTone.key)}
                </p>
                <Segmented
                  label={t('settings.filter')}
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: 'all', label: t('settings.all') },
                    { value: 'active', label: t('settings.active') },
                    { value: 'archived', label: t('settings.archived') },
                  ]}
                />
                <Switch
                  checked={backup}
                  onChange={setBackup}
                  label={t('settings.backup')}
                />
                <SliderRow
                  label={t('settings.quality')}
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  fmt={(value) => `${value}%`}
                  onChange={setQuality}
                />
              </div>
            </Card>

            <Card title={t('search.title')} subtitle={t('search.subtitle')}>
              <div className="ui-stack ui-stack--md">
                <EmptyState
                  icon="🔍"
                  title={t('search.emptyTitle')}
                  detail={t('search.emptyDetail')}
                />
                <Button variant="secondary" icon="＋">
                  {t('search.add')}
                </Button>
              </div>
            </Card>

            <Card title={t('delete.title')} subtitle={t('delete.subtitle')}>
              <div className="ui-row">
                <Button
                  variant="destructive"
                  icon="✕"
                  onClick={() => setDeleteOpen(true)}
                >
                  {t('delete.button')}
                </Button>
              </div>
            </Card>
          </div>
        </Section>
      </main>

      <footer className="landing__footer">
        <div className="landing__container">{t('footer')}</div>
      </footer>

      <Sheet
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        title={t('intro.title')}
      >
        <div className="ui-stack ui-stack--md">
          <p>{t('intro.body')}</p>
          <Button variant="primary" block onClick={() => setIntroOpen(false)}>
            {t('intro.gotIt')}
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('confirm.title')}
      >
        <div className="ui-stack ui-stack--md">
          <p>
            {t('confirm.body')} {albumName || t('settings.albumDefault')}
          </p>
          <div className="ui-row">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t('confirm.cancel')}
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(false)}>
              {t('confirm.confirm')}
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AccentProvider>
        <App />
      </AccentProvider>
    </ThemeProvider>
  </StrictMode>,
);
