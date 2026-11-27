import { useState } from 'react';
import {
  Button,
  NumberField,
  Select,
  Sheet,
  Stepper,
  TextArea,
  TextInput,
} from '@ilovecode33/ui';
import { newId, type KRUnit, type KeyResult, type Objective } from '@ilovecode33/okr-shared';
import styles from './ObjectiveEditor.module.css';

const UNIT_OPTIONS: Array<{ value: KRUnit; label: string }> = [
  { value: 'percent', label: 'Percent' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
];

interface DraftKR {
  id: string;
  title: string;
  start: string;
  target: string;
  current: string;
  unit: KRUnit;
  weight: number;
}

interface Draft {
  id: string;
  title: string;
  note: string;
  period: string;
  createdAt: string;
  keyResults: DraftKR[];
}

function blankKr(): DraftKR {
  return {
    id: newId(),
    title: '',
    start: '0',
    target: '100',
    current: '0',
    unit: 'percent',
    weight: 5,
  };
}

function toDraft(objective: Objective | null): Draft {
  if (!objective) {
    return {
      id: newId(),
      title: '',
      note: '',
      period: '2026 Q4',
      createdAt: new Date().toISOString(),
      keyResults: [blankKr()],
    };
  }
  return {
    id: objective.id,
    title: objective.title,
    note: objective.note,
    period: objective.period,
    createdAt: objective.createdAt,
    keyResults: objective.keyResults.length
      ? objective.keyResults.map((kr) => ({
          id: kr.id,
          title: kr.title,
          start: String(kr.start),
          target: String(kr.target),
          current: String(kr.current),
          unit: kr.unit,
          weight: kr.weight,
        }))
      : [blankKr()],
  };
}

function numeric(value: string, fallback: number): number {
  const parsed = Number(value);
  return value.trim() !== '' && Number.isFinite(parsed) ? parsed : fallback;
}

export function ObjectiveEditor({
  objective,
  onSave,
  onClose,
}: {
  objective: Objective | null;
  onSave: (objective: Objective) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(objective));
  const [error, setError] = useState('');

  function patchKr(id: string, patch: Partial<DraftKR>) {
    setDraft((prev) => ({
      ...prev,
      keyResults: prev.keyResults.map((kr) => (kr.id === id ? { ...kr, ...patch } : kr)),
    }));
  }

  function save() {
    const title = draft.title.trim();
    if (!title) {
      setError('Add a title for this objective.');
      return;
    }
    const keyResults: KeyResult[] = draft.keyResults
      .filter((kr) => kr.title.trim() !== '')
      .map((kr) => ({
        id: kr.id,
        title: kr.title.trim(),
        start: numeric(kr.start, 0),
        target: numeric(kr.target, 0),
        current: numeric(kr.current, 0),
        unit: kr.unit,
        weight: Math.min(Math.max(Math.round(numeric(String(kr.weight), 5)), 1), 10),
      }));
    onSave({
      id: draft.id,
      title,
      note: draft.note.trim(),
      period: draft.period.trim() || '2026 Q4',
      keyResults,
      createdAt: draft.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <Sheet open onClose={onClose} title={objective ? 'Edit objective' : 'New objective'}>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Title</span>
          <TextInput
            className={styles.input}
            value={draft.title}
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, title: event.target.value }));
              if (error) setError('');
            }}
            placeholder="What do you want to achieve?"
          />
        </label>
        {error && (
          <p className={styles.error} data-ui="error" role="alert">
            {error}
          </p>
        )}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Note</span>
          <TextArea
            className={styles.input}
            value={draft.note}
            onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Optional context for future you"
            rows={3}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Period</span>
          <TextInput
            className={styles.input}
            value={draft.period}
            onChange={(event) => setDraft((prev) => ({ ...prev, period: event.target.value }))}
            placeholder="2026 Q4"
          />
        </label>

        <div>
          <p className={styles.section}>Key results</p>
          <ul className={styles.krList}>
            {draft.keyResults.map((kr, index) => (
              <li className={styles.kr} key={kr.id}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Key result {index + 1}</span>
                  <TextInput
                    className={styles.input}
                    value={kr.title}
                    onChange={(event) => patchKr(kr.id, { title: event.target.value })}
                    placeholder="What will change?"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Start</span>
                  <NumberField
                    className={styles.input}
                    value={kr.start}
                    onChange={(event) => patchKr(kr.id, { start: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Target</span>
                  <NumberField
                    className={styles.input}
                    value={kr.target}
                    onChange={(event) => patchKr(kr.id, { target: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Current</span>
                  <NumberField
                    className={styles.input}
                    value={kr.current}
                    onChange={(event) => patchKr(kr.id, { current: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Unit</span>
                  <Select<KRUnit>
                    aria-label={`Unit for key result ${index + 1}`}
                    value={kr.unit}
                    options={UNIT_OPTIONS}
                    onChange={(event) => patchKr(kr.id, { unit: event.target.value })}
                  />
                </label>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Weight</span>
                  <Stepper
                    value={kr.weight}
                    onChange={(weight) => patchKr(kr.id, { weight })}
                    min={1}
                    max={10}
                    step={1}
                    label={`Weight for key result ${index + 1}`}
                  />
                </div>
                <Button
                  size="compact"
                  variant="plain"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      keyResults: prev.keyResults.filter((item) => item.id !== kr.id),
                    }))
                  }
                  aria-label={`Remove key result ${index + 1}`}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <Button
            size="compact"
            onClick={() => setDraft((prev) => ({ ...prev, keyResults: [...prev.keyResults, blankKr()] }))}
          >
            Add key result
          </Button>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Save objective
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
