import { Badge, Button, Card, Divider, ProgressBar, Row } from '@ilovecode33/ui';
import { objectiveProgress, type Objective } from '@ilovecode33/okr-shared';
import { Pencil, Trash2 } from 'lucide-react';
import { KeyResultRow } from './KeyResultRow';
import styles from './ObjectiveCard.module.css';

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
  const progress = Math.round(objectiveProgress(objective) * 100);

  return (
    <Card title={objective.title}>
      <div className={styles.body}>
        <Row className={styles.meta}>
          <Badge tone="accent">{objective.period}</Badge>
          <span className={styles.updated}>
            Updated {new Date(objective.updatedAt).toLocaleDateString('en-US')}
          </span>
        </Row>
        {objective.note && <p className={styles.note}>{objective.note}</p>}
        <ProgressBar value={progress} label={`${objective.title} progress`} />
        <Row className={styles.actions}>
          <Button
            size="compact"
            onClick={onEdit}
            icon={<Pencil />}
            aria-label={`Edit ${objective.title}`}
          >
            Edit
          </Button>
          <Button
            size="compact"
            variant="destructive"
            onClick={onDelete}
            icon={<Trash2 />}
            aria-label={`Delete ${objective.title}`}
          >
            Delete
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
          <p className={styles.note}>No key results yet.</p>
        )}
      </div>
    </Card>
  );
}
