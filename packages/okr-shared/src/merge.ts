import type {
  DeletedItems,
  KeyResult,
  Objective,
  OKRState,
  UserProfile,
} from './types';

type DeletedKind = keyof DeletedItems;

function tombstoneTime(
  deleted: DeletedItems | undefined,
  kind: DeletedKind,
  key: string,
): string | undefined {
  return deleted?.[kind]?.[key];
}

/** Serializes with sorted object keys, so equal data compares equal everywhere. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, sortKeys(record[key])]),
    );
  }
  return value;
}

/** Compares two JSON values, so ties resolve the same way on every device. */
function stableCompare(left: unknown, right: unknown): number {
  const a = canonicalJson(left);
  const b = canonicalJson(right);
  if (a === b) return 0;
  return a > b ? 1 : -1;
}

function mergeStamps(
  local: Record<string, string> | undefined,
  remote: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!local && !remote) return undefined;
  const merged: Record<string, string> = { ...local };
  for (const [key, stamp] of Object.entries(remote ?? {})) {
    const current = merged[key];
    if (!current || stamp > current) merged[key] = stamp;
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function mergeDeleted(
  local: DeletedItems | undefined,
  remote: DeletedItems | undefined,
): DeletedItems | undefined {
  const objectives = mergeStamps(local?.objectives, remote?.objectives);
  const keyResults = mergeStamps(local?.keyResults, remote?.keyResults);
  if (!objectives && !keyResults) return undefined;
  return {
    ...(objectives ? { objectives } : {}),
    ...(keyResults ? { keyResults } : {}),
  };
}

/** The last edit of a key result, falling back to its objective for older data. */
function keyResultStamp(keyResult: KeyResult, objective: Objective): string {
  return keyResult.updatedAt ?? objective.updatedAt;
}

function metadataWinner(local: Objective, remote: Objective): 'local' | 'remote' {
  if (local.updatedAt !== remote.updatedAt) {
    return remote.updatedAt > local.updatedAt ? 'remote' : 'local';
  }
  return stableCompare(remote, local) > 0 ? 'remote' : 'local';
}

function mergeKeyResults(
  local: Objective,
  remote: Objective,
  winner: 'local' | 'remote',
  deleted: DeletedItems | undefined,
): KeyResult[] {
  const preferred = winner === 'local' ? local : remote;
  const other = winner === 'local' ? remote : local;
  const rivals = new Map(other.keyResults.map((item) => [item.id, item]));
  const merged: KeyResult[] = [];
  const seen = new Set<string>();

  function consider(
    keyResult: KeyResult,
    owner: Objective,
    rival: KeyResult | undefined,
  ): void {
    if (seen.has(keyResult.id)) return;
    seen.add(keyResult.id);

    let chosen = keyResult;
    let chosenOwner = owner;
    if (rival) {
      const ownStamp = keyResultStamp(keyResult, owner);
      const rivalStamp = keyResultStamp(rival, other);
      if (
        rivalStamp > ownStamp ||
        (rivalStamp === ownStamp && stableCompare(rival, keyResult) > 0)
      ) {
        chosen = rival;
        chosenOwner = other;
      }
    }

    const tombstone = tombstoneTime(
      deleted,
      'keyResults',
      `${chosenOwner.id}/${chosen.id}`,
    );
    if (tombstone && tombstone >= keyResultStamp(chosen, chosenOwner)) return;
    merged.push(chosen);
  }

  for (const keyResult of preferred.keyResults) {
    consider(keyResult, preferred, rivals.get(keyResult.id));
  }
  const extras = other.keyResults
    .filter((keyResult) => !seen.has(keyResult.id))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const keyResult of extras) consider(keyResult, other, undefined);

  return merged;
}

function mergeObjective(
  local: Objective,
  remote: Objective,
  deleted: DeletedItems | undefined,
): Objective | null {
  const winner = metadataWinner(local, remote);
  const chosen = winner === 'remote' ? remote : local;
  const updatedAt =
    local.updatedAt > remote.updatedAt ? local.updatedAt : remote.updatedAt;

  const tombstone = tombstoneTime(deleted, 'objectives', chosen.id);
  if (tombstone && tombstone >= updatedAt) return null;

  return {
    ...chosen,
    createdAt:
      local.createdAt < remote.createdAt ? local.createdAt : remote.createdAt,
    updatedAt,
    keyResults: mergeKeyResults(local, remote, winner, deleted),
  };
}

function mergeSingleObjective(
  objective: Objective,
  deleted: DeletedItems | undefined,
): Objective | null {
  const tombstone = tombstoneTime(deleted, 'objectives', objective.id);
  if (tombstone && tombstone >= objective.updatedAt) return null;

  const keyResults = objective.keyResults.filter((keyResult) => {
    const krTombstone = tombstoneTime(
      deleted,
      'keyResults',
      `${objective.id}/${keyResult.id}`,
    );
    return !(krTombstone && krTombstone >= keyResultStamp(keyResult, objective));
  });
  return { ...objective, keyResults };
}

function mergeProfile(
  local: UserProfile | undefined,
  remote: UserProfile | undefined,
): UserProfile | undefined {
  if (!local) return remote;
  if (!remote) return local;
  if (local.updatedAt !== remote.updatedAt) {
    return remote.updatedAt > local.updatedAt ? remote : local;
  }
  return stableCompare(remote, local) > 0 ? remote : local;
}

/**
 * Merges two copies of the same OKR document.
 *
 * Objectives are matched by id. For an objective edited on both sides, the copy
 * with the newer `updatedAt` supplies title, note, and dates, while key results
 * merge per id by their own `updatedAt`. Deletions are kept as tombstones so a
 * device that still has the old copy cannot bring the item back. The display
 * name in `profile` uses the same rule: the newer `updatedAt` wins, and an
 * empty name clears it.
 *
 * The result is deterministic and commutative: merging the same pair in either
 * order returns equal data, which lets both devices converge without trading
 * messages forever.
 */
export function mergeStates(local: OKRState, remote: OKRState): OKRState {
  const deleted = mergeDeleted(local.deleted, remote.deleted);
  const remoteById = new Map(remote.objectives.map((item) => [item.id, item]));
  const merged: Objective[] = [];
  const seen = new Set<string>();

  for (const objective of local.objectives) {
    seen.add(objective.id);
    const counterpart = remoteById.get(objective.id);
    const result = counterpart
      ? mergeObjective(objective, counterpart, deleted)
      : mergeSingleObjective(objective, deleted);
    if (result) merged.push(result);
  }
  for (const objective of remote.objectives) {
    if (seen.has(objective.id)) continue;
    const result = mergeSingleObjective(objective, deleted);
    if (result) merged.push(result);
  }

  merged.sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  const profile = mergeProfile(local.profile, remote.profile);

  return {
    version: 1,
    objectives: merged,
    ...(deleted ? { deleted } : {}),
    ...(profile ? { profile } : {}),
  };
}

/** Removes an objective and remembers the deletion for later merges. */
export function deleteObjective(
  state: OKRState,
  objectiveId: string,
  at: string = new Date().toISOString(),
): OKRState {
  const deleted = state.deleted ?? {};
  return {
    ...state,
    objectives: state.objectives.filter((item) => item.id !== objectiveId),
    deleted: {
      ...deleted,
      objectives: { ...deleted.objectives, [objectiveId]: at },
    },
  };
}

/** Removes a key result and remembers the deletion for later merges. */
export function deleteKeyResult(
  state: OKRState,
  objectiveId: string,
  keyResultId: string,
  at: string = new Date().toISOString(),
): OKRState {
  const deleted = state.deleted ?? {};
  return {
    ...state,
    objectives: state.objectives.map((objective) =>
      objective.id === objectiveId
        ? {
            ...objective,
            updatedAt: at,
            keyResults: objective.keyResults.filter(
              (item) => item.id !== keyResultId,
            ),
          }
        : objective,
    ),
    deleted: {
      ...deleted,
      keyResults: {
        ...deleted.keyResults,
        [`${objectiveId}/${keyResultId}`]: at,
      },
    },
  };
}
