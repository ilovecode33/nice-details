import { Badge, Button, Card, Divider, ProgressBar, Row } from '@ilovecode33/ui';
import {
  objectiveProgress,
  periodProgress,
  quarterLabel,
  type Objective,
} from '@ilovecode33/okr-shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useOkrI18n } from '../i18n';
import { KeyResultRow } from './KeyResultRow';
import styles from './ObjectiveCard.module.css';

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(locale);
}

export function ObjectiveCard({
  objective,
  onEdit,
  onDelete,
  onUpdateKr,
  onDeleteKr,
}: {
  objective: Objective;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateKr: (krId: string, current: number) => void;
  onDeleteKr: (krId: string) => void;
}) {
  const { t, intlLocale } = useOkrI18n();
  const progress = Math.round(objectiveProgress(objective) * 100);
  const timing = periodProgress(objective.startDate, objective.endDate);
  const periodLabel =
    objective.period || quarterLabel(objective.startDate);
  const countdown =
    timing.status === 'upcoming'
      ? t(
          timing.daysLeft === 1
            ? 'objective.startsInOne'
            : 'objective.startsIn',
          { days: timing.daysLeft },
        )
      : timing.status === 'ended'
        ? t('objective.periodEnded')
        : t(
            timing.daysLeft === 1
              ? 'objective.dayLeft'
              : 'objective.daysLeft',
            { days: timing.daysLeft },
          );

  return (
    <Card title={objective.title}>
      <div className={styles.body}>
        <Row className={styles.meta}>
          <Badge tone="accent">{periodLabel}</Badge>
          <span className={styles.updated}>
            {t('objective.created', {
              date: formatDate(objective.createdAt, intlLocale),
            })}
          </span>
          <span className={styles.updated}>
            {t('objective.updated', {
              date: formatDate(objective.updatedAt, intlLocale),
            })}
          </span>
        </Row>
        {objective.note && <p className={styles.note}>{objective.note}</p>}
        <div className={styles.time}>
          <div className={styles.timeHeader}>
            <span>{countdown}</span>
            <span>{t('objective.elapsed', { percent: timing.percent })}</span>
          </div>
          <div
            data-ui="progress-track"
            role="progressbar"
            aria-label={t('objective.timeElapsed')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={timing.percent}
          >
            <div style={{ width: `${timing.percent}%` }} />
          </div>
        </div>
        <ProgressBar
          value={progress}
          label={t('objective.progress', { title: objective.title })}
        />
        <Row className={styles.actions}>
          <Button
            size="compact"
            onClick={onEdit}
            icon={<Pencil />}
            aria-label={t('objective.editLabel', { title: objective.title })}
          >
            {t('common.edit')}
          </Button>
          <Button
            size="compact"
            variant="destructive"
            onClick={onDelete}
            icon={<Trash2 />}
            aria-label={t('objective.deleteLabel', { title: objective.title })}
          >
            {t('common.delete')}
          </Button>
        </Row>
        <Divider />
        {objective.keyResults.length ? (
          <ul className={styles.krList}>
            {objective.keyResults.map((kr) => (
              <KeyResultRow
                key={kr.id}
                kr={kr}
                onUpdate={(value) => onUpdateKr(kr.id, value)}
                onDelete={() => onDeleteKr(kr.id)}
              />
            ))}
          </ul>
        ) : (
          <p className={styles.note}>{t('objective.noKeyResults')}</p>
        )}
      </div>
    </Card>
  );
}
