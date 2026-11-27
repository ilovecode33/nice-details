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
  keyResultProgress,
  overallProgress,
  sortObjectives,
  type Objective,
  type ObjectiveSort,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { AlertTriangle, Plus, RotateCcw, Target } from 'lucide-react';
import { ObjectiveCard } from './components/ObjectiveCard';
import { ObjectiveEditor } from './components/ObjectiveEditor';
import { getOkrStorage, type OkrStorage } from './storage';
import styles from './App.module.css';

const ALL_PERIODS = 'all';
const EMPTY_OBJECTIVES: Objective[] = [];

const SORT_OPTIONS: Array<{ value: ObjectiveSort; label: string }> = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'progress', label: 'Progress' },
  { value: 'title', label: 'Title' },
];

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
  const [state, setState] = useState<OKRState | null>(null);
  const [period, setPeriod] = useState(ALL_PERIODS);
  const [sort, setSort] = useState<ObjectiveSort>('updated');
  // undefined = closed, null = create a new objective, otherwise the one to edit.
  const [editing, setEditing] = useState<Objective | null | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const storageRef = useRef<OkrStorage | null>(storage ?? null);
  const loadedRef = useRef(false);

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
    { value: ALL_PERIODS, label: 'All periods' },
    ...periods.map((value) => ({ value, label: value })),
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
      title: 'Delete objective?',
      message: `“${objective.title}” and its key results will be removed.`,
      confirmLabel: 'Delete',
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
      title: 'Delete key result?',
      message: `“${kr?.title ?? 'This key result'}” will be removed from this objective.`,
      confirmLabel: 'Delete',
      onConfirm: () =>
        patchObjective(objective.id, (current) => ({
          ...current,
          keyResults: current.keyResults.filter((item) => item.id !== krId),
        })),
    });
  }

  function askToReset() {
    setConfirmation({
      title: 'Reset sample data?',
      message: 'Your current objectives will be replaced with the sample set.',
      confirmLabel: 'Reset',
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
          <h1>My OKRs</h1>
          <p>Keep a few goals in view and record progress as you go.</p>
        </div>
        <div className={styles.headerControls}>
          <ThemeSwitcher />
          <AccentSwitcher />
        </div>
      </header>

      {state === null ? (
        <Card>
          <div className={styles.status}>
            {loadError ? (
              <>
                <EmptyState
                  icon={<AlertTriangle />}
                  title="Couldn't open your OKR database"
                  detail={loadError}
                />
                <Button variant="primary" onClick={retryLoad}>
                  Try again
                </Button>
              </>
            ) : (
              <ActivityIndicator label="Loading your objectives" />
            )}
          </div>
        </Card>
      ) : (
        <>
          {saveError && (
            <p className={styles.storageError} role="alert">
              Changes are not being saved: {saveError}
            </p>
          )}

          <section className={styles.summary} aria-label="Summary">
            <Stat label="Objectives" value={objectives.length} tone="accent" />
            <div className={styles.summaryProgress}>
              <span className={styles.summaryValue}>{progress}%</span>
              <span className={styles.summaryLabel}>Overall progress</span>
              <ProgressBar value={progress} label="Overall progress" />
            </div>
            <Stat
              label="Completed key results"
              value={completedKrs}
              tone="success"
            />
          </section>

          <section className={styles.toolbar} aria-label="Objective filters">
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Period</span>
              <Select
                aria-label="Filter by period"
                value={period}
                options={periodOptions}
                onChange={(event) => setPeriod(event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Sort by</span>
              <Select<ObjectiveSort>
                aria-label="Sort objectives"
                value={sort}
                options={SORT_OPTIONS}
                onChange={(event) => setSort(event.target.value)}
              />
            </label>
            <Button
              variant="primary"
              onClick={() => setEditing(null)}
              icon={<Plus />}
            >
              New objective
            </Button>
            <Button variant="plain" onClick={askToReset} icon={<RotateCcw />}>
              Reset sample data
            </Button>
          </section>

          {visible.length === 0 ? (
            <Card>
              <div className={styles.empty}>
                <EmptyState
                  icon={<Target />}
                  title={
                    objectives.length
                      ? 'No objectives in this period'
                      : 'No objectives yet'
                  }
                  detail="Create one to start tracking your progress."
                />
                <Button
                  variant="primary"
                  onClick={() => setEditing(null)}
                  icon={<Plus />}
                >
                  New objective
                </Button>
              </div>
            </Card>
          ) : (
            <section className={styles.list} aria-label="Objectives">
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
          cancelLabel="Cancel"
          destructive
          onConfirm={confirmation.onConfirm}
        />
      )}
    </main>
  );
}
