import { useEffect, useState } from 'react';
import { Button, NumberField, Stepper } from '@ilovecode33/ui';
import {
  clamp,
  formatValue,
  keyResultProgress,
  type KeyResult,
} from '@ilovecode33/okr-shared';
import { Trash2 } from 'lucide-react';
import { useOkrI18n } from '../i18n';
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
  const { t, intlLocale } = useOkrI18n();
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
          {t('kr.valueOf', {
            current: formatValue(kr.unit, kr.current, intlLocale),
            target: formatValue(kr.unit, kr.target, intlLocale),
          })}
        </span>
      </div>
      <div
        data-ui="progress-track"
        role="progressbar"
        aria-label={t('kr.progress', { title: kr.title })}
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
            label={t('kr.percentLabel', { title: kr.title })}
            decreaseLabel={t('common.decrease')}
            increaseLabel={t('common.increase')}
          />
        ) : (
          <NumberField
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={t('kr.currentValueLabel', { title: kr.title })}
          />
        )}
        <Button size="compact" onClick={save} disabled={!valid}>
          {t('common.save')}
        </Button>
        <Button
          size="compact"
          variant="plain"
          onClick={onDelete}
          aria-label={t('kr.deleteLabel', { title: kr.title })}
          icon={<Trash2 />}
        >
          {t('common.delete')}
        </Button>
      </div>
    </li>
  );
}
