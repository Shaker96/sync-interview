import { MobileApp } from '../src/app.js';
import { TestClock } from '../src/clock.js';
import { Database, type Order } from '../src/database.js';
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
export function assertAppMatchesDatabase({ clock, db, app }: ReturnType<typeof setup>, show = 5): void {
  clock.advance(60);
  app.sync();

  const wrong = db.all().filter((order) => JSON.stringify(app.get(order.id)) !== JSON.stringify(order));
  if (wrong.length === 0) {
    return;
  }

  const count = wrong.length === 1 ? '1 order' : `${wrong.length} orders`;
  const lines = [`The app's copy is different from the database for ${count}:`];
  for (const order of wrong.slice(0, show)) {
    const inApp = app.get(order.id);
    lines.push('', `  order ${order.id}`);
    lines.push(`    database: ${describe(order)}`);
    lines.push(`    app:      ${inApp ? describe(inApp) : 'not in the app'}`);
  }
  if (wrong.length > show) {
    lines.push('', `  ...and ${wrong.length - show} more`);
  }

  throw new Error(lines.join('\n'));
}

function describe(order: Order): string {
  return `status ${order.status}, total ${order.total}, updatedAt ${order.updatedAt} (${utc(order.updatedAt)})`;
}

/** 1793016000 -> "2026-10-26 12:00:00 UTC" */
function utc(seconds: number): string {
  return new Date(seconds * 1000).toISOString().replace('T', ' ').replace('.000Z', ' UTC');
}
