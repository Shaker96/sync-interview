import assert from 'node:assert/strict';
import { MobileApp } from '../src/app.js';
import { TestClock } from '../src/clock.js';
import { Database } from '../src/database.js';
import { SyncServer } from '../src/server.js';
import { ImportService, WarehouseService } from '../src/services.js';

export function setup() {
  const clock = new TestClock();
  const db = new Database(clock);
  const server = new SyncServer(db, clock);

  return {
    clock,
    db,
    warehouse: new WarehouseService(db, clock),
    importer: new ImportService(db, clock),
    app: new MobileApp(server),
  };
}

/** Later on, the app syncs again. Afterwards it must hold exactly what the database holds. */
export function assertAppMatchesDatabase({ clock, db, app }: ReturnType<typeof setup>): void {
  clock.advance(60);
  app.sync();

  const wrong = db
    .all()
    .filter((order) => JSON.stringify(app.get(order.id)) !== JSON.stringify(order))
    .map((order) => ({ database: order, app: app.get(order.id) ?? 'missing' }));

  assert.deepEqual(wrong, [], 'the app does not match the database');
}
