import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccentSwitcher,
  ActivityIndicator,
  AlertDialog,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Select,
  Stat,
  ThemeSwitcher,
} from '@ilovecode33/ui';
import {
  collectPeriods,
  createSampleState,
  formatPeriodLabel,
  keyResultProgress,
  overallProgress,
  sortObjectives,
  type Objective,
  type ObjectiveSort,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { parseSyncLink } from './realtime';
import { AlertTriangle, Plus, RefreshCw, RotateCcw, Target } from 'lucide-react';
import { ObjectiveCard } from './components/ObjectiveCard';
import { ObjectiveEditor } from './components/ObjectiveEditor';
import { SyncPanel } from './components/SyncPanel';
import { LOCALES, LOCALE_NAMES, useOkrI18n } from './i18n';
import { getOkrStorage, type OkrStorage } from './storage';
import styles from './App.module.css';

const ALL_PERIODS = 'all';
const EMPTY_OBJECTIVES: Objective[] = [];

interface Confirmation {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

export interface AppProps {
  /** Injected in tests; the app normally opens IndexedDB lazily. */
  storage?: OkrStorage;
}

export function App({ storage }: AppProps = {}) {
  const { locale, setLocale, intlLocale, t } = useOkrI18n();
  const [state, setState] = useState<OKRState | null>(null);
  const [period, setPeriod] = useState(ALL_PERIODS);
  const [sort, setSort] = useState<ObjectiveSort>('updated');
  // undefined = closed, null = create a new objective, otherwise the one to edit.
  const [editing, setEditing] = useState<Objective | null | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncLink, setSyncLink] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const storageRef = useRef<OkrStorage | null>(storage ?? null);
  const loadedRef = useRef(false);

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
    storageRef.current = storage ?? null;
    setState(null);
    setLoadError(null);
    setSaveError(null);

    const pending = storage ? Promise.resolve(storage) : getOkrStorage();
    pending
      .then(async (current) => {
        const loaded = await current.load();
        if (cancelled) return;
        storageRef.current = current;
        setState(loaded);
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
        : objectives.filter((item) => item.period === period);
    return sortObjectives(filtered, sort);
  }, [objectives, period, sort]);

  const progress = state ? Math.round(overallProgress(objectives) * 100) : 0;
  const completedKrs = objectives.reduce(
    (count, item) =>
      count + item.keyResults.filter((kr) => keyResultProgress(kr) >= 1).length,
    0,
  );
  const periodOptions = [
    { value: ALL_PERIODS, label: t('toolbar.allPeriods') },
    ...periods.map((value) => {
      const objective = objectives.find((item) => item.period === value);
      return {
        value,
        label: objective
          ? formatPeriodLabel(
              objective.startDate,
              objective.endDate,
              intlLocale,
            )
          : value,
      };
    }),
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
      const exists = prev.objectives.some((objective) => objective.id === next.id);
      return {
        ...prev,
        objectives: exists
          ? prev.objectives.map((objective) =>
              objective.id === next.id ? next : objective,
            )
          : [...prev.objectives, next],
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
          prev
            ? {
                ...prev,
                objectives: prev.objectives.filter(
                  (item) => item.id !== objective.id,
                ),
              }
            : prev,
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
        patchObjective(objective.id, (current) => ({
          ...current,
          keyResults: current.keyResults.filter((item) => item.id !== krId),
        })),
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
          <h1>{t('app.title')}</h1>
          <p>{t('app.subtitle')}</p>
        </div>
        <div className={styles.headerControls}>
          <Select
            className={styles.locale}
            aria-label={t('app.language')}
            value={locale}
            options={LOCALES.map((value) => ({
              value,
              label: LOCALE_NAMES[value],
            }))}
            onChange={(event) => setLocale(event.target.value)}
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
            <Button
              variant="plain"
              onClick={() => setSyncOpen(true)}
              icon={<RefreshCw />}
            >
              {t('sync.open')}
            </Button>
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
                        kr.id === krId ? { ...kr, current } : kr,
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
          initialMode={syncLink ? 'join' : 'host'}
          initialRoom={syncLink}
          onRemoteState={(next) => {
            setState(next);
            setPeriod(ALL_PERIODS);
          }}
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
