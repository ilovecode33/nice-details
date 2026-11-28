import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccentSwitcher,
  ActivityIndicator,
  AlertDialog,
  Button,
  Card,
  DockNavigation,
  EmptyState,
  ProgressBar,
  Select,
  Stat,
  ThemeSwitcher,
} from '@ilovecode33/ui';
import {
  collectPeriods,
  createSampleState,
  deleteKeyResult,
  deleteObjective,
  keyResultProgress,
  objectiveProgress,
  objectiveQuarters,
  overallProgress,
  periodProgress,
  sortObjectives,
  type KeyResult,
  type Objective,
  type ObjectiveSort,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { parseSyncLink, type RealtimeStatus } from './realtime';
import {
  AlertTriangle,
  Check,
  LayoutDashboard,
  ListChecks,
  MonitorDown,
  Plus,
  RotateCcw,
  Settings,
  Target,
} from 'lucide-react';
import { ObjectiveCard } from './components/ObjectiveCard';
import { ObjectiveEditor } from './components/ObjectiveEditor';
import { SyncPanel } from './components/SyncPanel';
import { SyncStatus } from './components/SyncStatus';
import { LOCALES, LOCALE_NAMES, useOkrI18n } from './i18n';
import { useInstallPrompt } from './useInstallPrompt';
import { useThemeChrome } from './useThemeChrome';
import { getOkrStorage, type OkrStorage, type StoredSyncRoom } from './storage';
import styles from './App.module.css';

const ALL_PERIODS = 'all';
const EMPTY_OBJECTIVES: Objective[] = [];

/** Bottom-navigation pages. */
type AppPage = 'dashboard' | 'okrs' | 'settings';

interface Confirmation {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

function sameKeyResult(left: KeyResult, right: KeyResult): boolean {
  return (
    left.title === right.title &&
    left.start === right.start &&
    left.target === right.target &&
    left.current === right.current &&
    left.unit === right.unit &&
    left.weight === right.weight
  );
}

export interface AppProps {
  /** Injected in tests; the app normally opens IndexedDB lazily. */
  storage?: OkrStorage;
}

export function App({ storage }: AppProps = {}) {
  const { locale, setLocale, t } = useOkrI18n();
  useThemeChrome();
  const [state, setState] = useState<OKRState | null>(null);
  const [page, setPage] = useState<AppPage>('dashboard');
  const [dockCollapsed, setDockCollapsed] = useState(true);
  const appVersion = import.meta.env.PUBLIC_APP_VERSION ?? '0.0.0';
  const install = useInstallPrompt();
  const [period, setPeriod] = useState(ALL_PERIODS);
  const [sort, setSort] = useState<ObjectiveSort>('updated');
  // undefined = closed, null = create a new objective, otherwise the one to edit.
  const [editing, setEditing] = useState<Objective | null | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncLink, setSyncLink] = useState('');
  const [syncStatus, setSyncStatus] = useState<RealtimeStatus | 'idle'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const storageRef = useRef<OkrStorage | null>(storage ?? null);
  const loadedRef = useRef(false);
  const viewLoadedRef = useRef(false);

  const loadStoredRoom = useCallback(async () => {
    return (await storageRef.current?.loadSyncRoom()) ?? null;
  }, []);
  const saveStoredRoom = useCallback(async (room: StoredSyncRoom) => {
    await storageRef.current?.saveSyncRoom(room);
  }, []);
  const clearStoredRoom = useCallback(async () => {
    await storageRef.current?.clearSyncRoom();
  }, []);
  const loadStoredDeviceName = useCallback(async () => {
    return (await storageRef.current?.loadDeviceName()) ?? null;
  }, []);
  const saveStoredDeviceName = useCallback(async (name: string) => {
    await storageRef.current?.saveDeviceName(name);
  }, []);

  useEffect(() => {
    document.title = t('app.title');
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const room = parseSyncLink(window.location.href);
    if (!room) return;
    setSyncLink(window.location.href);
    setSyncOpen(true);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadedRef.current = false;
    viewLoadedRef.current = false;
    storageRef.current = storage ?? null;
    setState(null);
    setLoadError(null);
    setSaveError(null);

    const pending = storage ? Promise.resolve(storage) : getOkrStorage();
    pending
      .then(async (current) => {
        const [loaded, view] = await Promise.all([
          current.load(),
          current.loadView(),
        ]);
        if (cancelled) return;
        storageRef.current = current;
        setState(loaded);
        if (view) {
          setSort(view.sort);
          setPeriod(
            view.period === ALL_PERIODS ||
              collectPeriods(loaded.objectives).includes(view.period)
              ? view.period
              : ALL_PERIODS,
          );
        }
        viewLoadedRef.current = true;
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storage, attempt]);

  useEffect(() => {
    if (!viewLoadedRef.current || !storageRef.current) return;
    void storageRef.current.saveView({ period, sort });
  }, [period, sort]);

  useEffect(() => {
    if (!state || !storageRef.current) return;
    if (!loadedRef.current) {
      // The first effect after load is the loaded state itself; do not rewrite it.
      loadedRef.current = true;
      return;
    }
    void storageRef.current.save(state).then(
      () => setSaveError(null),
      (error: unknown) =>
        setSaveError(error instanceof Error ? error.message : String(error)),
    );
  }, [state]);

  const objectives = state?.objectives ?? EMPTY_OBJECTIVES;
  const periods = useMemo(() => collectPeriods(objectives), [objectives]);
  const visible = useMemo(() => {
    const filtered =
      period === ALL_PERIODS
        ? objectives
        : objectives.filter((item) =>
            objectiveQuarters(item).includes(period),
          );
    return sortObjectives(filtered, sort);
  }, [objectives, period, sort]);
  const focus = useMemo(
    () =>
      objectives
        .map((objective) => ({
          objective,
          timing: periodProgress(objective.startDate, objective.endDate),
        }))
        .filter((item) => item.timing.status === 'active')
        .sort((a, b) => a.timing.daysLeft - b.timing.daysLeft)
        .slice(0, 3),
    [objectives],
  );
  const pageTitle =
    page === 'dashboard'
      ? t('app.title')
      : page === 'okrs'
        ? t('nav.okrs')
        : t('nav.settings');
  const pageSubtitle =
    page === 'dashboard'
      ? t('app.subtitle')
      : page === 'okrs'
        ? t('okrs.subtitle')
        : t('settings.subtitle');
  // The collapsed dock shows icons only; the label stays available to
  // assistive tech and appears again when the dock is expanded.
  const navLabel = (label: string) =>
    dockCollapsed ? <span className="ui-sr-only">{label}</span> : label;

  const progress = state ? Math.round(overallProgress(objectives) * 100) : 0;
  const completedKrs = objectives.reduce(
    (count, item) =>
      count + item.keyResults.filter((kr) => keyResultProgress(kr) >= 1).length,
    0,
  );
  const periodOptions = [
    { value: ALL_PERIODS, label: t('toolbar.allPeriods') },
    ...periods.map((value) => ({ value, label: value })),
  ];
  const sortOptions: Array<{ value: ObjectiveSort; label: string }> = [
    { value: 'updated', label: t('sort.updated') },
    { value: 'progress', label: t('sort.progress') },
    { value: 'title', label: t('sort.title') },
  ];

  function patchObjective(id: string, patch: (objective: Objective) => Objective) {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        objectives: prev.objectives.map((objective) =>
          objective.id === id
            ? { ...patch(objective), updatedAt: new Date().toISOString() }
            : objective,
        ),
      };
    });
  }

  function saveObjective(next: Objective) {
    setState((prev) => {
      if (!prev) return prev;
      const now = new Date().toISOString();
      const existing = prev.objectives.find(
        (objective) => objective.id === next.id,
      );
      // Unchanged key results keep their timestamp, so a concurrent edit on
      // another device still wins the merge for them.
      const keyResults = next.keyResults.map((keyResult) => {
        const before = existing?.keyResults.find(
          (item) => item.id === keyResult.id,
        );
        if (before && sameKeyResult(before, keyResult)) {
          return {
            ...keyResult,
            updatedAt: before.updatedAt ?? existing?.updatedAt ?? now,
          };
        }
        return { ...keyResult, updatedAt: now };
      });
      const saved: Objective = { ...next, keyResults };
      return {
        ...prev,
        objectives: existing
          ? prev.objectives.map((objective) =>
              objective.id === saved.id ? saved : objective,
            )
          : [...prev.objectives, saved],
      };
    });
    setEditing(undefined);
  }

  function askToDeleteObjective(objective: Objective) {
    setConfirmation({
      title: t('confirm.deleteObjective.title'),
      message: t('confirm.deleteObjective.message', { title: objective.title }),
      confirmLabel: t('common.delete'),
      onConfirm: () =>
        setState((prev) =>
          prev ? deleteObjective(prev, objective.id) : prev,
        ),
    });
  }

  function askToDeleteKr(objective: Objective, krId: string) {
    const kr = objective.keyResults.find((item) => item.id === krId);
    setConfirmation({
      title: t('confirm.deleteKeyResult.title'),
      message: t('confirm.deleteKeyResult.message', {
        title: kr?.title ?? t('kr.thisKeyResult'),
      }),
      confirmLabel: t('common.delete'),
      onConfirm: () =>
        setState((prev) =>
          prev ? deleteKeyResult(prev, objective.id, krId) : prev,
        ),
    });
  }

  function askToReset() {
    setConfirmation({
      title: t('confirm.reset.title'),
      message: t('confirm.reset.message'),
      confirmLabel: t('common.reset'),
      onConfirm: () => {
        setSaveError(null);
        setState(createSampleState());
        setPeriod(ALL_PERIODS);
        setSort('updated');
      },
    });
  }

  function retryLoad() {
    setAttempt((value) => value + 1);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerIntro}>
          <h1>{pageTitle}</h1>
          <p>{pageSubtitle}</p>
        </div>
      </header>

      {state === null ? (
        <Card>
          <div className={styles.status}>
            {loadError ? (
              <>
                <EmptyState
                  icon={<AlertTriangle />}
                  title={t('loadError.title')}
                  detail={loadError}
                />
                <Button variant="primary" onClick={retryLoad}>
                  {t('loadError.retry')}
                </Button>
              </>
            ) : (
              <ActivityIndicator label={t('loading')} />
            )}
          </div>
        </Card>
      ) : (
        <>
          {saveError && (
            <p className={styles.storageError} role="alert">
              {t('saveError', { error: saveError })}
            </p>
          )}

          {page === 'dashboard' && (
            <>
              <section className={styles.summary} aria-label={t('summary.aria')}>
                <Stat
                  label={t('summary.objectives')}
                  value={objectives.length}
                  tone="accent"
                />
                <div className={styles.summaryProgress}>
                  <span className={styles.summaryValue}>{progress}%</span>
                  <span className={styles.summaryLabel}>
                    {t('summary.overallProgress')}
                  </span>
                  <ProgressBar
                    value={progress}
                    label={t('summary.overallProgress')}
                  />
                </div>
                <Stat
                  label={t('summary.completedKeyResults')}
                  value={completedKrs}
                  tone="success"
                />
              </section>

              <section className={styles.focus} aria-label={t('dashboard.focus')}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('dashboard.focus')}</h2>
                  <Button variant="plain" onClick={() => setPage('okrs')}>
                    {t('dashboard.viewAll')}
                  </Button>
                </div>
                {focus.length === 0 ? (
                  <Card>
                    <div className={styles.empty}>
                      <EmptyState
                        icon={<Target />}
                        title={t('dashboard.empty')}
                        detail={t('empty.detail')}
                      />
                    </div>
                  </Card>
                ) : (
                  <div className={styles.focusList}>
                    {focus.map(({ objective, timing }) => {
                      const value = Math.round(objectiveProgress(objective) * 100);
                      return (
                        <Card key={objective.id}>
                          <div className={styles.focusCard}>
                            <span className={styles.focusTitle}>
                              {objective.title}
                            </span>
                            <ProgressBar
                              value={value}
                              label={t('objective.progress', {
                                title: objective.title,
                              })}
                            />
                            <span className={styles.focusMeta}>
                              {timing.daysLeft === 1
                                ? t('objective.dayLeft', { days: 1 })
                                : t('objective.daysLeft', {
                                    days: timing.daysLeft,
                                  })}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {page === 'okrs' && (
            <>
              <section className={styles.toolbar} aria-label={t('toolbar.aria')}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{t('toolbar.period')}</span>
                  <Select
                    aria-label={t('toolbar.filterAria')}
                    value={period}
                    options={periodOptions}
                    onChange={(event) => setPeriod(event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{t('toolbar.sort')}</span>
                  <Select<ObjectiveSort>
                    aria-label={t('toolbar.sortAria')}
                    value={sort}
                    options={sortOptions}
                    onChange={(event) => setSort(event.target.value)}
                  />
                </label>
                <Button
                  variant="primary"
                  onClick={() => setEditing(null)}
                  icon={<Plus />}
                >
                  {t('toolbar.newObjective')}
                </Button>
                {import.meta.env.DEV && (
                  <Button variant="plain" onClick={askToReset} icon={<RotateCcw />}>
                    {t('toolbar.reset')}
                  </Button>
                )}
              </section>

              {visible.length === 0 ? (
                <Card>
                  <div className={styles.empty}>
                    <EmptyState
                      icon={<Target />}
                      title={
                        objectives.length
                          ? t('empty.noPeriod')
                          : t('empty.noObjectives')
                      }
                      detail={t('empty.detail')}
                    />
                    <Button
                      variant="primary"
                      onClick={() => setEditing(null)}
                      icon={<Plus />}
                    >
                      {t('toolbar.newObjective')}
                    </Button>
                  </div>
                </Card>
              ) : (
                <section className={styles.list} aria-label={t('list.aria')}>
                  {visible.map((objective) => (
                    <ObjectiveCard
                      key={objective.id}
                      objective={objective}
                      onEdit={() => setEditing(objective)}
                      onDelete={() => askToDeleteObjective(objective)}
                      onUpdateKr={(krId, current) =>
                        patchObjective(objective.id, (currentObjective) => ({
                          ...currentObjective,
                          keyResults: currentObjective.keyResults.map((kr) =>
                            kr.id === krId
                              ? {
                                  ...kr,
                                  current,
                                  updatedAt: new Date().toISOString(),
                                }
                              : kr,
                          ),
                        }))
                      }
                      onDeleteKr={(krId) => askToDeleteKr(objective, krId)}
                    />
                  ))}
                </section>
              )}
            </>
          )}

          {page === 'settings' && (
            <div className={styles.settings}>
              <Card className={styles.settingsCard} title={t('theme.group')}>
                <div className={styles.settingsFields}>
                  <ThemeSwitcher
                    labels={{
                      group: t('theme.group'),
                      system: t('theme.system'),
                      light: t('theme.light'),
                      dark: t('theme.dark'),
                    }}
                  />
                  <div className={styles.settingsRow}>
                    <span className={styles.settingsLabel}>{t('accent.group')}</span>
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
              </Card>

              <Card className={styles.settingsCard} title={t('app.language')}>
                <Select
                  className={styles.settingsSelect}
                  aria-label={t('app.language')}
                  value={locale}
                  options={LOCALES.map((value) => ({
                    value,
                    label: LOCALE_NAMES[value],
                  }))}
                  onChange={(event) => setLocale(event.target.value)}
                />
              </Card>

              <Card
                className={styles.settingsCard}
                title={t('sync.title')}
                subtitle={t('settings.syncHint')}
              >
                <SyncStatus status={syncStatus} onOpen={() => setSyncOpen(true)} />
              </Card>

              <Card className={styles.settingsCard} title={t('install.title')}>
                {install.installed ? (
                  <p className={styles.installState}>
                    <Check size={16} aria-hidden="true" />
                    {t('install.installed')}
                  </p>
                ) : (
                  <div className={styles.installBody}>
                    <p className={styles.installHint}>{t('install.hint')}</p>
                    {install.canPrompt ? (
                      <Button
                        variant="primary"
                        icon={<MonitorDown />}
                        onClick={() => void install.prompt()}
                      >
                        {t('install.action')}
                      </Button>
                    ) : (
                      <p className={styles.installHint}>
                        {install.ios ? t('install.ios') : t('install.manual')}
                      </p>
                    )}
                  </div>
                )}
              </Card>

              <Card className={styles.settingsCard} title={t('settings.about')}>
                <div className={styles.settingsRow}>
                  <span className={styles.settingsLabel}>{t('settings.version')}</span>
                  <span className={styles.version}>{appVersion}</span>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      <DockNavigation
        label={t('nav.label')}
        activeId={page}
        collapsed={dockCollapsed}
        onCollapsedChange={setDockCollapsed}
        collapseLabel={t('nav.collapse')}
        expandLabel={t('nav.expand')}
        onSelect={(id) => setPage(id as AppPage)}
        items={[
          {
            id: 'dashboard',
            label: navLabel(t('nav.dashboard')),
            icon: (
              <span className={styles.navIcon}>
                <LayoutDashboard size={18} />
              </span>
            ),
          },
          {
            id: 'okrs',
            label: navLabel(t('nav.okrs')),
            icon: (
              <span className={styles.navIcon}>
                <ListChecks size={18} />
              </span>
            ),
          },
          {
            id: 'settings',
            label: navLabel(t('nav.settings')),
            icon: (
              <span className={styles.navIcon}>
                <Settings size={18} />
              </span>
            ),
          },
        ]}
      />

      {state && (
        <SyncPanel
          key={syncLink || 'sync-manual'}
          open={syncOpen}
          onClose={() => setSyncOpen(false)}
          onDisconnect={() => {
            setSyncOpen(false);
            setSyncLink('');
          }}
          state={state}
          initialRoom={syncLink}
          onStatusChange={setSyncStatus}
          loadStoredRoom={loadStoredRoom}
          saveStoredRoom={saveStoredRoom}
          clearStoredRoom={clearStoredRoom}
          loadStoredDeviceName={loadStoredDeviceName}
          saveStoredDeviceName={saveStoredDeviceName}
          onRemoteState={(next) => setState(next)}
        />
      )}

      {state && editing !== undefined && (
        <ObjectiveEditor
          key={editing?.id ?? 'new'}
          objective={editing}
          onSave={saveObjective}
          onClose={() => setEditing(undefined)}
        />
      )}

      {confirmation && (
        <AlertDialog
          open
          onClose={() => setConfirmation(null)}
          title={confirmation.title}
          message={confirmation.message}
          confirmLabel={confirmation.confirmLabel}
          cancelLabel={t('common.cancel')}
          destructive
          onConfirm={confirmation.onConfirm}
        />
      )}
    </main>
  );
}
