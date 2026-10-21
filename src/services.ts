import type { Clock } from './clock.js';
import type { Database } from './database.js';

/**
 * Warehouse service: changes the status of one order at a time.
 */
export class WarehouseService {
  constructor(private readonly db: Database, private readonly clock: Clock) {}

  setStatus(id: string, status: string): void {
    this.db.write(id, { status }, this.clock.now());
  }
}

/**
 * Import service: recalculates order totals in batches. A batch is one run of the import;
 * all the changes in it belong to that run.
 */
export class ImportService {
  constructor(private readonly db: Database, private readonly clock: Clock) {}

  startBatch(): ImportBatch {
    return new ImportBatch(this.db, this.clock.now());
  }
}

export class ImportBatch {
  constructor(private readonly db: Database, private readonly runAt: number) {}

  setTotal(id: string, total: number): void {
    this.db.write(id, { total }, this.runAt);
  }
}
