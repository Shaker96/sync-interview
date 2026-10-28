import type { Clock } from './clock.js';
import type { Database, Order } from './database.js';

export type Checkpoint = { updatedAt: number; id: number };

export type PullRequest = { checkpoint: Checkpoint | null; limit: number };

export type PullResponse = {
  orders: Order[];
  /** Where the next pull continues from: the last order of this page. Null when the page is empty. */
  checkpoint: Checkpoint | null;
  serverTime: number;
};

/**
 * The sync endpoint the mobile app calls (in the real system: GET /pull).
 * Returns the orders changed after the checkpoint, oldest first.
 */
export class SyncServer {
  constructor(private readonly db: Database, private readonly clock: Clock) {}

  pull({ checkpoint, limit }: PullRequest): PullResponse {
    const changed = this.db
      .all()
      .filter(
        (order) =>
          !checkpoint ||
          order.updatedAt > checkpoint.updatedAt ||
          (order.updatedAt === checkpoint.updatedAt && order.id > checkpoint.id),
      )
      .sort((a, b) => a.updatedAt - b.updatedAt || a.id - b.id)
      .slice(0, limit);

    const last = changed.at(-1);

    return {
      orders: changed,
      checkpoint: last ? { updatedAt: last.updatedAt, id: last.id } : null,
      serverTime: this.clock.now(),
    };
  }
}
