import type { Order } from './database.js';
import type { Checkpoint, SyncServer } from './server.js';

/**
 * The mobile app's sync. It works like the sync library the real app uses, which we
 * can't change: ask for pages starting at the last checkpoint until a page comes back
 * empty, keep every order received, save the checkpoint the server sends back.
 */
export class MobileApp {
  private readonly orders = new Map<number, Order>();
  private checkpoint: Checkpoint | null = null;

  constructor(private readonly server: SyncServer, private readonly pageSize = 5) {}

  sync(): void {
    for (let pages = 0; ; pages++) {
      if (pages === 10_000) {
        throw new Error('sync never finished: the server never returned an empty page');
      }

      const page = this.server.pull({ checkpoint: this.checkpoint, limit: this.pageSize });

      if (page.orders.length === 0) {
        return;
      }

      for (const order of page.orders) {
        this.orders.set(order.id, order);
      }
      this.checkpoint = page.checkpoint;
    }
  }

  get(id: number): Order | undefined {
    return this.orders.get(id);
  }
}
