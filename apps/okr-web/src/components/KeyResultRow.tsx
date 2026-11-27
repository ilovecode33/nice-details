import { useEffect, useState } from 'react';
import { Button, NumberField, Stepper } from '@ilovecode33/ui';
import {
  clamp,
  formatValue,
  keyResultProgress,
  type KeyResult,
} from '@ilovecode33/okr-shared';
import { Trash2 } from 'lucide-react';
import styles from './KeyResultRow.module.css';

export function KeyResultRow({
  kr,
  onUpdate,
  onDelete,
}: {
  kr: KeyResult;
  onUpdate: (value: number) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(() => String(kr.current));
  useEffect(() => setDraft(String(kr.current)), [kr.current]);

  const parsed = Number(draft);
  const valid = draft.trim() !== '' && Number.isFinite(parsed);
  const percent = Math.round(keyResultProgress(kr) * 100);

  function save() {
    if (!valid) return;
    onUpdate(kr.unit === 'percent' ? clamp(parsed, 0, 100) : parsed);
  }

  return (
    <li className={styles.kr}>
      <div className={styles.head}>
        <span className={styles.title}>{kr.title}</span>
        <span className={styles.numbers}>
          {formatValue(kr.unit, kr.current)} of {formatValue(kr.unit, kr.target)}
        </span>
      </div>
      <div
        data-ui="progress-track"
        role="progressbar"
        aria-label={`${kr.title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.update}>
        {kr.unit === 'percent' ? (
          <Stepper
            value={clamp(Math.round(valid ? parsed : 0), 0, 100)}
            onChange={(value) => setDraft(String(value))}
            min={0}
            max={100}
            step={5}
            label={`${kr.title} percent`}
          />
        ) : (
          <NumberField
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={`Current value for ${kr.title}`}
          />
        )}
        <Button size="compact" onClick={save} disabled={!valid}>
          Save
        </Button>
        <Button
          size="compact"
          variant="plain"
          onClick={onDelete}
          aria-label={`Delete key result ${kr.title}`}
          icon={<Trash2 />}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
