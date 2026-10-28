import type { Clock } from './clock.js';

export type Order = {
  id: number;
  status: string;
  total: number;
  /** Unix seconds of the first write. */
  createdAt: number;
  /** Unix seconds of the last change. The sync reads this field. */
  updatedAt: number;
};

/** In-memory stand-in for the orders database. */
export class Database {
  private readonly orders = new Map<number, Order>();

  constructor(private readonly clock: Clock) {}

  /** Saves a change to an order (creating it if needed) with the updatedAt the caller gives. */
  write(id: number, changes: Partial<Pick<Order, 'status' | 'total'>>, updatedAt: number): void {
    const current = this.orders.get(id) ?? { id, status: 'Saved', total: 0, createdAt: this.clock.now(), updatedAt };
    this.orders.set(id, { ...current, ...changes, updatedAt });
  }

  get(id: number): Order | undefined {
    const order = this.orders.get(id);
    return order && { ...order };
  }

  all(): Order[] {
    return [...this.orders.values()].map((order) => ({ ...order }));
  }
}
