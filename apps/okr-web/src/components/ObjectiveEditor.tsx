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
import {
  addMonths,
  formatQuarterSpan,
  newId,
  quarterLabel,
  quarterSpan,
  todayIso,
  type KeyResult,
  type KRUnit,
  type Objective,
} from '@ilovecode33/okr-shared';
import { useOkrI18n } from '../i18n';
import styles from './ObjectiveEditor.module.css';

const LENGTH_VALUES = [1, 2, 3, 6, 12] as const;

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
  startDate: string;
  endDate: string;
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
    const startDate = todayIso();
    return {
      id: newId(),
      title: '',
      note: '',
      startDate,
      endDate: addMonths(startDate, 2),
      createdAt: new Date().toISOString(),
      keyResults: [blankKr()],
    };
  }
  return {
    id: objective.id,
    title: objective.title,
    note: objective.note,
    startDate: objective.startDate,
    endDate: objective.endDate,
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

/** Returns the quick-length option matching the current dates, if any. */
function matchedLength(startDate: string, endDate: string): number | undefined {
  if (!startDate || !endDate) return undefined;
  return LENGTH_VALUES.find((months) => addMonths(startDate, months) === endDate);
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
  const { t } = useOkrI18n();
  const [draft, setDraft] = useState<Draft>(() => toDraft(objective));
  const [error, setError] = useState('');

  const unitOptions: Array<{ value: KRUnit; label: string }> = [
    { value: 'percent', label: t('editor.unit.percent') },
    { value: 'number', label: t('editor.unit.number') },
    { value: 'currency', label: t('editor.unit.currency') },
  ];
  const lengthOptions: Array<{ value: string; label: string }> = [
    { value: 'custom', label: t('editor.length.custom') },
    ...LENGTH_VALUES.map((months) => ({
      value: String(months),
      label: t(
        months === 1 ? 'editor.length.month' : 'editor.length.months',
        { count: months },
      ),
    })),
  ];

  const quarterLabelText = formatQuarterSpan(
    quarterSpan(draft.startDate, draft.endDate),
  );
  const quickLength = matchedLength(draft.startDate, draft.endDate);
  const quickLengthValue = quickLength ? String(quickLength) : 'custom';

  function patchKr(id: string, patch: Partial<DraftKR>) {
    setDraft((prev) => ({
      ...prev,
      keyResults: prev.keyResults.map((kr) => (kr.id === id ? { ...kr, ...patch } : kr)),
    }));
  }

  function save() {
    const title = draft.title.trim();
    if (!title) {
      setError(t('editor.error.title'));
      return;
    }
    if (!draft.startDate || !draft.endDate) {
      setError(t('editor.error.dates'));
      return;
    }
    if (draft.endDate < draft.startDate) {
      setError(t('editor.error.order'));
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
      period: quarterLabel(draft.startDate),
      startDate: draft.startDate,
      endDate: draft.endDate,
      keyResults,
      createdAt: draft.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={
        objective ? t('editor.title.edit') : t('editor.title.new')
      }
      closeLabel={t('common.close')}
    >
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.title')}</span>
          <TextInput
            className={styles.input}
            value={draft.title}
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, title: event.target.value }));
              if (error) setError('');
            }}
            placeholder={t('editor.titlePlaceholder')}
          />
        </label>
        {error && (
          <p className={styles.error} data-ui="error" role="alert">
            {error}
          </p>
        )}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.note')}</span>
          <TextArea
            className={styles.input}
            value={draft.note}
            onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
            placeholder={t('editor.notePlaceholder')}
            rows={3}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.startDate')}</span>
          <TextInput
            className={styles.input}
            type="date"
            value={draft.startDate}
            onChange={(event) => {
              const startDate = event.target.value;
              setDraft((prev) => {
                const keepLength = matchedLength(prev.startDate, prev.endDate);
                return {
                  ...prev,
                  startDate,
                  endDate: keepLength ? addMonths(startDate, keepLength) : prev.endDate,
                };
              });
              if (error) setError('');
            }}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.endDate')}</span>
          <TextInput
            className={styles.input}
            type="date"
            value={draft.endDate}
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, endDate: event.target.value }));
              if (error) setError('');
            }}
          />
        </label>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('editor.quickLength')}</span>
          <Select
            aria-label={t('editor.quickLengthAria')}
            value={quickLengthValue}
            options={lengthOptions}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'custom') return;
              const months = Number(value);
              if (!Number.isFinite(months)) return;
              setDraft((prev) => ({
                ...prev,
                endDate: addMonths(prev.startDate, months),
              }));
              if (error) setError('');
            }}
          />
        </div>

        {quarterLabelText && (
          <p className={styles.hint}>
            {t('editor.periodHint', { period: quarterLabelText })}
          </p>
        )}

        <div>
          <p className={styles.section}>{t('editor.keyResults')}</p>
          <ul className={styles.krList}>
            {draft.keyResults.map((kr, index) => (
              <li className={styles.kr} key={kr.id}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>
                    {t('editor.keyResult', { index: index + 1 })}
                  </span>
                  <TextInput
                    className={styles.input}
                    value={kr.title}
                    onChange={(event) => patchKr(kr.id, { title: event.target.value })}
                    placeholder={t('editor.keyResultPlaceholder')}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{t('editor.start')}</span>
                  <NumberField
                    className={styles.input}
                    value={kr.start}
                    onChange={(event) => patchKr(kr.id, { start: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{t('editor.target')}</span>
                  <NumberField
                    className={styles.input}
                    value={kr.target}
                    onChange={(event) => patchKr(kr.id, { target: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{t('editor.current')}</span>
                  <NumberField
                    className={styles.input}
                    value={kr.current}
                    onChange={(event) => patchKr(kr.id, { current: event.target.value })}
                  />
                </label>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t('editor.unit')}</span>
                  <Select<KRUnit>
                    aria-label={t('editor.unitAria', { index: index + 1 })}
                    value={kr.unit}
                    options={unitOptions}
                    onChange={(event) => patchKr(kr.id, { unit: event.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{t('editor.weight')}</span>
                  <Stepper
                    value={kr.weight}
                    onChange={(weight) => patchKr(kr.id, { weight })}
                    min={1}
                    max={10}
                    step={1}
                    label={t('editor.weightAria', { index: index + 1 })}
                    decreaseLabel={t('common.decrease')}
                    increaseLabel={t('common.increase')}
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
                  aria-label={t('editor.removeKeyResultAria', {
                    index: index + 1,
                  })}
                >
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
          <Button
            size="compact"
            onClick={() => setDraft((prev) => ({ ...prev, keyResults: [...prev.keyResults, blankKr()] }))}
          >
            {t('editor.addKeyResult')}
          </Button>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={save}>
            {t('editor.saveObjective')}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
