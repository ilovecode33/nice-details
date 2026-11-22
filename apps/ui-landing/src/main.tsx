import { StrictMode, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { listReducer, selectionModeReducer } from '@ilovecode33/ui-core';
import {
  AccentSwitcher,
  ActionSheet,
  ActivityIndicator,
  AlertDialog,
  AspectImage,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  cn,
  Carousel,
  Checkbox,
  Chip,
  DatePicker,
  Deformable,
  Disclosure,
  Divider,
  EmptyState,
  Field,
  DockNavigation,
  type DockNavigationHandle,
  FormField,
  GlassSurface,
  List,
  NavBar,
  NumberField,
  PhotoGrid,
  PhotoViewer,
  Popover,
  ProgressBar,
  RadioGroup,
  SearchBar,
  Segmented,
  Select,
  Sheet,
  Skeleton,
  SliderRow,
  Stat,
  StatusStat,
  Stepper,
  Switch,
  TabBar,
  TextArea,
  TextInput,
  Thumbnail,
  ThemeSwitcher,
  Toast,
  UIFoundation,
  useLocale,
  type ListItem,
  type PhotoItem,
} from '@ilovecode33/ui';
import '@ilovecode33/ui/styles.css';
import './app.css';
import {
  DICTIONARIES,
  LOCALES,
  LOCALE_NAMES,
  type Locale,
  type TranslationKey,
} from './i18n';
import { COMPONENT_GROUPS, group } from './component-groups';

type Tone = 'warm' | 'ocean' | 'forest' | 'violet' | 'citrus';
type LibraryTab = 'albums' | 'shared' | 'archive';
type AlbumId = 'travel' | 'family' | 'street';

const TONES: Array<{ value: Tone; color: string; key: TranslationKey }> = [
  { value: 'warm', color: '#b23a0a', key: 'tone.warm' },
  { value: 'ocean', color: '#1565c0', key: 'tone.ocean' },
  { value: 'forest', color: '#2e7d32', key: 'tone.forest' },
  { value: 'violet', color: '#6a1b9a', key: 'tone.violet' },
  { value: 'citrus', color: '#8a9a00', key: 'tone.citrus' },
];

const ALBUM_IDS = ['travel', 'family', 'street'] as const;

const PHOTOS: Array<{
  id: string;
  emoji: string;
  color: string;
  key: TranslationKey;
}> = [
  { id: 'p1', emoji: '⛰', color: 'linear-gradient(135deg,#b23a0a,#ff9a76)', key: 'photo.mountains' },
  { id: 'p2', emoji: '≈', color: 'linear-gradient(135deg,#1565c0,#7ab8ff)', key: 'photo.ocean' },
  { id: 'p3', emoji: '♣', color: 'linear-gradient(135deg,#2e7d32,#8fd694)', key: 'photo.forest' },
  { id: 'p4', emoji: '▦', color: 'linear-gradient(135deg,#6a1b9a,#c4a8f0)', key: 'photo.city' },
  { id: 'p5', emoji: '◒', color: 'linear-gradient(135deg,#8a9a00,#d7ff5f)', key: 'photo.desert' },
  { id: 'p6', emoji: '✧', color: 'linear-gradient(135deg,#1b3a6b,#5a7d00)', key: 'photo.night' },
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
  const { locale, setLocale, t } = useLocale();

  const [buttonAction, setButtonAction] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [backup, setBackup] = useState(true);
  const [quality, setQuality] = useState(75);
  const [tone, setTone] = useState<Tone>('warm');
  const [selectValue, setSelectValue] = useState('newest');
  const [checked, setChecked] = useState(true);
  const [visibility, setVisibility] = useState<'private' | 'shared'>('private');
  const [copies, setCopies] = useState(1);
  const [chip, setChip] = useState('favorites');
  const [draftName, setDraftName] = useState('');
  const [draftError, setDraftError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('2026-11-21');
  const [budget, setBudget] = useState('12');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('albums');
  const [listState, dispatchList] = useReducer(listReducer<AlbumId>, {
    items: ALBUM_IDS,
    expandedIds: [] as AlbumId[],
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [selection, dispatchSelection] = useReducer(selectionModeReducer, {
    active: false,
    selectedIds: [] as string[],
  });
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState(COMPONENT_GROUPS[0].id);
  const dockRef = useRef<DockNavigationHandle>(null);

  const selectedTone = TONES.find((item) => item.value === tone) ?? TONES[0];
  const photoItems: PhotoItem[] = PHOTOS.map((photo) => ({
    id: photo.id,
    alt: t(photo.key),
    emoji: photo.emoji,
    style: { background: photo.color },
  }));
  const albums: Array<ListItem<AlbumId>> = [
    {
      id: 'travel',
      title: t('library.albumTravel'),
      subtitle: `24 ${t('library.photos')}`,
      leading: <span className={cn('ui-thumb')} style={{ background: TONES[0].color }}>✈</span>,
      trailing: <Badge tone="accent">24</Badge>,
      expandedContent: t('library.detailsBody'),
    },
    {
      id: 'family',
      title: t('library.albumFamily'),
      subtitle: `12 ${t('library.photos')}`,
      leading: <span className={cn('ui-thumb')} style={{ background: TONES[2].color }}>♡</span>,
      trailing: <Badge tone="success">12</Badge>,
      expandedContent: t('library.detailsBody'),
    },
    {
      id: 'street',
      title: t('library.albumStreet'),
      subtitle: `8 ${t('library.photos')}`,
      leading: <span className={cn('ui-thumb')} style={{ background: TONES[1].color }}>◫</span>,
      trailing: <Badge>8</Badge>,
      expandedContent: t('library.detailsBody'),
    },
  ];

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
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToGroup = (id: string) => {
    setActiveGroup(id);
    document.getElementById(`group-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const action = (label: string) => {
    setButtonAction(`${t('demo.clicked')}: ${label}`);
  };

  return (
    <>
      <main id="top" className="landing__container">
        <section className="landing__hero">
          <p className="landing__eyebrow">{t('hero.eyebrow')}</p>
          <h1>
            {t('hero.title')}
            <br />
            {t('hero.subtitle')}
          </h1>
          <p className="landing__lead">{t('hero.lead')}</p>
          <div className={cn('ui-row')}>
            <Button variant="primary" icon="→" onClick={() => setSheetOpen(true)}>
              {t('hero.ctaDemo')}
            </Button>
            <Button variant="secondary" onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('hero.ctaDetails')}
            </Button>
          </div>
          <div className={cn('ui-row landing__toolbar')}>
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
        </section>

        <Section id="details" title={t('details.title')} subtitle={t('details.subtitle')}>
          <div className={cn('ui-stack ui-stack--lg')}>
              {/* Button */}
              <Card id="group-button" title={t(group('button').title)} subtitle={t(group('button').subtitle)}>
                <div className={cn('ui-stack ui-stack--md')}>
                  <span id="component-button" className="component-anchor" aria-hidden="true" />
                  <div className={cn('ui-row')}>
                    <Button variant="primary" onClick={() => action(t('demo.primary'))}>{t('demo.primary')}</Button>
                    <Button variant="secondary" onClick={() => action(t('demo.secondary'))}>{t('demo.secondary')}</Button>
                    <Button variant="destructive" onClick={() => action(t('demo.destructive'))}>{t('demo.destructive')}</Button>
                    <Button variant="plain" onClick={() => action(t('demo.plain'))}>{t('demo.plain')}</Button>
                  </div>
                  <Divider />
                  <div className={cn('ui-row')}>
                    <Button icon="＋" onClick={() => action(t('demo.withIcon'))}>{t('demo.withIcon')}</Button>
                    <Button size="compact" onClick={() => action(t('demo.compact'))}>{t('demo.compact')}</Button>
                    <Button disabled>{t('demo.disabled')}</Button>
                  </div>
                  <Button variant="primary" block onClick={() => action(t('demo.block'))}>{t('demo.block')}</Button>
                  {buttonAction && <p className={cn('ui-muted')}>{buttonAction}</p>}
                </div>
              </Card>

              {/* Card / Layout / Divider */}
              <Card id="group-layout" title={t(group('layout').title)} subtitle={t(group('layout').subtitle)}>
                <div className={cn('ui-stack ui-stack--md')}>
                  <span id="component-card" className="component-anchor" aria-hidden="true" />
                  <span id="component-stack-row" className="component-anchor" aria-hidden="true" />
                  <div className={cn('ui-stack ui-stack--sm')}>
                    <span className={cn('ui-muted')}>{t('demo.layout.subtitle')}</span>
                    <div className={cn('ui-row')}>
                      <Badge>{t('demo.secondary')}</Badge>
                      <Badge tone="accent">{t('demo.primary')}</Badge>
                    </div>
                  </div>
                  <span id="component-divider" className="component-anchor" aria-hidden="true" />
                  <Divider />
                </div>
              </Card>

              {/* Display */}
              <Card id="group-display" title={t(group('display').title)} subtitle={t(group('display').subtitle)}>
                <div className={cn('ui-stack ui-stack--md')}>
                  <span id="component-stat" className="component-anchor" aria-hidden="true" />
                  <span id="component-statusstat" className="component-anchor" aria-hidden="true" />
                  <div className={cn('ui-stat-grid')}>
                    <Stat label={t('upload.albums')} value={12} tone="accent" />
                    <StatusStat label={t('upload.success')} value={24} status="success" />
                    <StatusStat label={t('upload.failed')} value={2} status="danger" />
                  </div>
                  <span id="component-badge" className="component-anchor" aria-hidden="true" />
                  <div className={cn('ui-row')}>
                    <Badge>{t('settings.all')}</Badge>
                    <Badge tone="success">{t('upload.success')}</Badge>
                    <Badge tone="danger">{t('upload.failed')}</Badge>
                  </div>
                  <span id="component-emptystate" className="component-anchor" aria-hidden="true" />
                  <EmptyState icon="🔍" title={t('search.emptyTitle')} detail={t('search.emptyDetail')} />
                </div>
              </Card>

              {/* Selection */}
              <Card id="group-selection" title={t(group('selection').title)} subtitle={t(group('selection').subtitle)}>
                <div className={cn('ui-stack ui-stack--lg')}>
                  <span id="component-segmented" className="component-anchor" aria-hidden="true" />
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
                  <span id="component-switch" className="component-anchor" aria-hidden="true" />
                  <Switch checked={backup} onChange={setBackup} label={t('settings.backup')} />
                  <span id="component-select" className="component-anchor" aria-hidden="true" />
                  <Field label={t('settings.sort')}>
                    <Select
                      value={selectValue}
                      onChange={(event) => setSelectValue(event.target.value)}
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
                        leading: <span className={cn('ui-color-swatch')} style={{ background: item.color }} />,
                      }))}
                    />
                  </Field>
                  <span id="component-sliderrow" className="component-anchor" aria-hidden="true" />
                  <SliderRow label={t('settings.quality')} min={10} max={100} step={5} value={quality} fmt={(v) => `${v}%`} onChange={setQuality} />
                  <span id="component-checkbox" className="component-anchor" aria-hidden="true" />
                  <Checkbox checked={checked} onChange={setChecked} label={t('create.originals')} />
                  <span id="component-radiogroup" className="component-anchor" aria-hidden="true" />
                  <RadioGroup
                    label={t('create.visibility')}
                    value={visibility}
                    onChange={setVisibility}
                    options={[
                      { value: 'private', label: t('create.private') },
                      { value: 'shared', label: t('create.shared') },
                    ]}
                  />
                  <span id="component-chip" className="component-anchor" aria-hidden="true" />
                  <div className={cn('ui-row')}>
                    {['favorites', 'recent', 'hidden'].map((value) => (
                      <Chip key={value} selected={chip === value} onClick={() => setChip(value)}>
                        {t(value === 'favorites' ? 'library.tagFavorites' : value === 'recent' ? 'library.tagRecent' : 'library.tagHidden')}
                      </Chip>
                    ))}
                  </div>
                  <span id="component-stepper" className="component-anchor" aria-hidden="true" />
                  <Stepper label={t('create.copies')} value={copies} min={1} max={5} onChange={setCopies} />
                </div>
              </Card>

              {/* Forms */}
              <Card id="group-forms" title={t(group('forms').title)} subtitle={t(group('forms').subtitle)}>
                <form
                  className={cn('ui-stack ui-stack--md')}
                  onSubmit={(event) => {
                    event.preventDefault();
                    setDraftError(draftName.trim() ? '' : t('create.error'));
                  }}
                >
                  <span id="component-field" className="component-anchor" aria-hidden="true" />
                  <Field label={t('settings.name')} hint={t('settings.nameHint')}>
                    <span id="component-textinput" className="component-anchor" aria-hidden="true" />
                    <TextInput
                      value={draftName}
                      placeholder={t('settings.namePlaceholder')}
                      onChange={(event) => {
                        setDraftName(event.target.value);
                        if (event.target.value.trim()) setDraftError('');
                      }}
                    />
                  </Field>
                  <span id="component-formfield" className="component-anchor" aria-hidden="true" />
                  <FormField label={t('create.name')} hint={t('create.nameHint')} error={draftError}>
                    <TextInput
                      value={draftName}
                      placeholder={t('create.namePlaceholder')}
                      onChange={(event) => setDraftName(event.target.value)}
                    />
                  </FormField>
                  <span id="component-searchbar" className="component-anchor" aria-hidden="true" />
                  <SearchBar value={searchText} onChange={setSearchText} label={t('create.search')} placeholder={t('create.searchPlaceholder')} />
                  <span id="component-textarea" className="component-anchor" aria-hidden="true" />
                  <FormField label={t('create.notes')} hint={t('create.notesHint')}>
                    <TextArea value={notes} rows={3} onChange={(event) => setNotes(event.target.value)} />
                  </FormField>
                  <div className={cn('ui-stat-grid')}>
                    <FormField label={t('create.date')}>
                      <span id="component-datepicker" className="component-anchor" aria-hidden="true" />
                      <DatePicker value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                    </FormField>
                    <FormField label={t('create.price')}>
                      <span id="component-numberfield" className="component-anchor" aria-hidden="true" />
                      <NumberField value={budget} min={0} onChange={(event) => setBudget(event.target.value)} />
                    </FormField>
                  </div>
                  <Button variant="primary" type="submit" block>{t('create.submit')}</Button>
                </form>
              </Card>

              {/* Navigation */}
              <Card id="group-navigation" title={t(group('navigation').title)} subtitle={t(group('navigation').subtitle)}>
                <div className={cn('ui-stack ui-stack--md')}>
                  <span id="component-navbar" className="component-anchor" aria-hidden="true" />
                  <NavBar
                    title={t('library.navTitle')}
                    subtitle={t('library.navSubtitle')}
                    backLabel={t('library.back')}
                    onBack={() => setLibraryTab('albums')}
                    actions={<Badge tone="accent">{t('library.plan')}</Badge>}
                  />
                  <span id="component-tabbar" className="component-anchor" aria-hidden="true" />
                  <TabBar
                    variant="inline"
                    label={t('library.tabsLabel')}
                    value={libraryTab}
                    onChange={setLibraryTab}
                    items={[
                      { value: 'albums', label: t('library.tabAlbums'), icon: '▦' },
                      { value: 'shared', label: t('library.tabShared'), icon: '◉' },
                      { value: 'archive', label: t('library.tabArchive'), icon: '◷', badge: '3' },
                    ]}
                  />
                  <span id="component-list" className="component-anchor" aria-hidden="true" />
                  <span id="component-listrow" className="component-anchor" aria-hidden="true" />
                  <List
                    label={t('library.listLabel')}
                    items={albums}
                    selectedId={listState.selectedId}
                    expandedIds={listState.expandedIds}
                    onSelect={(id) => dispatchList({ type: 'select', value: id })}
                    onToggleExpanded={(id) => dispatchList({ type: 'toggleExpanded', value: id })}
                  />
                  <span id="component-disclosure" className="component-anchor" aria-hidden="true" />
                  <Disclosure title={t('library.details')} defaultOpen>
                    {t('library.detailsBody')}
                  </Disclosure>
                </div>
              </Card>

              {/* Overlays */}
              <Card id="group-overlays" title={t(group('overlays').title)} subtitle={t(group('overlays').subtitle)}>
                <div className={cn('ui-row')}>
                  <span id="component-sheet" className="component-anchor" aria-hidden="true" />
                  <Button variant="secondary" onClick={() => setSheetOpen(true)}>{t('demo.openSheet')}</Button>
                  <span id="component-actionsheet" className="component-anchor" aria-hidden="true" />
                  <Button variant="secondary" onClick={() => setActionOpen(true)}>{t('demo.openActionSheet')}</Button>
                  <span id="component-alertdialog" className="component-anchor" aria-hidden="true" />
                  <Button variant="destructive" onClick={() => setAlertOpen(true)}>{t('demo.openAlert')}</Button>
                  <div style={{ position: 'relative' }}>
                    <span id="component-popover" className="component-anchor" aria-hidden="true" />
                    <Button variant="plain" aria-expanded={popoverOpen} onClick={() => setPopoverOpen((open) => !open)}>
                      {t('demo.openPopover')}
                    </Button>
                    {popoverOpen && (
                      <Popover open label={t('progress.popover')} onClose={() => setPopoverOpen(false)}>
                        <p className={cn('ui-muted')}>{t('progress.popoverBody')}</p>
                      </Popover>
                    )}
                  </div>
                </div>
              </Card>

              {/* Feedback */}
              <Card id="group-feedback" title={t(group('feedback').title)} subtitle={t(group('feedback').subtitle)}>
                <div className={cn('ui-stack ui-stack--md')}>
                  <span id="component-banner" className="component-anchor" aria-hidden="true" />
                  {bannerVisible && (
                    <Banner tone="info" message={t('progress.banner')} onDismiss={() => setBannerVisible(false)} />
                  )}
                  <div className={cn('ui-row')}>
                    <span id="component-activityindicator" className="component-anchor" aria-hidden="true" />
                    <ActivityIndicator label={t('progress.loading')} />
                    <span className={cn('ui-muted')}>{t('progress.loading')}</span>
                  </div>
                  <span id="component-progressbar" className="component-anchor" aria-hidden="true" />
                  <ProgressBar value={quality} label={t('progress.loading')} />
                  <span id="component-skeleton" className="component-anchor" aria-hidden="true" />
                  <div className={cn('ui-stack ui-stack--sm')}>
                    <Skeleton width="70%" />
                    <Skeleton height="12px" />
                  </div>
                  <span id="component-toast" className="component-anchor" aria-hidden="true" />
                  <Button variant="secondary" onClick={() => setToastVisible(true)}>{t('demo.showToast')}</Button>
                </div>
              </Card>

              {/* Floating */}
              <Card id="group-floating" title={t(group('floating').title)} subtitle={t(group('floating').subtitle)}>
                <div className={cn('ui-stack ui-stack--md')}>
                  <span id="component-glasssurface" className="component-anchor" aria-hidden="true" />
                  <GlassSurface elevation="raised" className="landing__glass-sample" deform>
                    {t('floating.demoBody')}
                  </GlassSurface>
                  <span id="component-floatingbar" className="component-anchor" aria-hidden="true" />
                  <span id="component-deformable" className="component-anchor" aria-hidden="true" />
                  <div className={cn('ui-row')}>
                    <Deformable axis="x" className="landing__deform-chip">
                      {t('deform.axisX')}
                    </Deformable>
                    <Deformable axis="y" className="landing__deform-chip">
                      {t('deform.axisY')}
                    </Deformable>
                    <Deformable axis="both" className="landing__deform-chip">
                      {t('deform.axisBoth')}
                    </Deformable>
                  </div>
                  <span id="component-docknavigation" className="component-anchor" aria-hidden="true" />
                  <Button
                    variant="secondary"
                    onClick={() => dockRef.current?.toggle()}
                  >
                    {dockCollapsed ? t('floating.openDemo') : t('floating.hideDemo')}
                  </Button>
                </div>
              </Card>

              <Card id="group-media" title={t(group('media').title)} subtitle={t(group('media').subtitle)}>
                <div className={cn('ui-stack ui-stack--md')}>
                  <div className={cn('ui-row')}>
                    <span id="component-avatar" className="component-anchor" aria-hidden="true" />
                    <Avatar name="Ada Lovelace" />
                    <Avatar name="Grace Hopper" size="small" />
                    <span id="component-thumbnail" className="component-anchor" aria-hidden="true" />
                    <Thumbnail emoji="🌅" />
                    <Button variant="secondary" onClick={() => dispatchSelection({ type: selection.active ? 'exit' : 'enter' })}>
                      {selection.active ? t('gallery.done') : t('gallery.select')}
                    </Button>
                  </div>
                  <span id="component-aspectimage" className="component-anchor" aria-hidden="true" />
                  <div style={{ maxWidth: 240 }}>
                    <AspectImage style={photoItems[0].style} alt={photoItems[0].alt}>
                      {photoItems[0].emoji}
                    </AspectImage>
                  </div>
                  <span id="component-photogrid" className="component-anchor" aria-hidden="true" />
                  <PhotoGrid
                    items={photoItems}
                    label={t('gallery.gridLabel')}
                    selectionMode={selection.active}
                    selectedIds={selection.selectedIds}
                    onToggle={(id) => dispatchSelection({ type: 'toggle', id })}
                    onOpen={setViewerIndex}
                  />
                  {selection.active && (
                    <p className={cn('ui-muted')}>{t('gallery.selectedCount')}: {selection.selectedIds.length}</p>
                  )}
                  <span id="component-photoviewer" className="component-anchor" aria-hidden="true" />
                  <span id="component-carousel" className="component-anchor" aria-hidden="true" />
                  <Carousel items={photoItems.slice(0, 3)} label={t('gallery.carouselLabel')} index={carouselIndex} onIndexChange={setCarouselIndex} />
                </div>
              </Card>
          </div>
        </Section>
      </main>

      {/* Footer and navigation are one floating dock. */}
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

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('intro.title')}>
        <div className={cn('ui-stack ui-stack--md')}>
          <p>{t('intro.body')}</p>
          <Button variant="primary" block onClick={() => setSheetOpen(false)}>{t('intro.gotIt')}</Button>
        </div>
      </Sheet>

      <AlertDialog
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={t('confirm.title')}
        message={t('confirm.body')}
        cancelLabel={t('confirm.cancel')}
        confirmLabel={t('confirm.confirm')}
        destructive
        onConfirm={() => setAlertOpen(false)}
      />

      <Toast
        tone="success"
        message={t('progress.toast')}
        visible={toastVisible}
        actionLabel={t('progress.undo')}
        onAction={() => setToastVisible(false)}
        onDismiss={() => setToastVisible(false)}
      />

      <ActionSheet
        open={actionOpen}
        onClose={() => setActionOpen(false)}
        title={t('progress.actionSheet')}
        actions={[
          { label: t('progress.action1'), onSelect: () => undefined },
          { label: t('progress.action2'), onSelect: () => undefined, destructive: true },
        ]}
      />

      {viewerIndex !== null && (
        <PhotoViewer
          items={photoItems}
          index={viewerIndex}
          onIndexChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
          title={t('gallery.viewerLabel')}
        />
      )}
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
