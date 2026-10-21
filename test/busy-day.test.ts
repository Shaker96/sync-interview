import { test } from 'node:test';
import type { ImportBatch } from '../src/services.js';
import { seededRandom } from './random.js';
import { assertAppMatchesDatabase, setup } from './setup.js';

/**
 * A busy day: both services and the app keep running, mixed in random order, for 2,000 steps.
 * The same seed always gives the same day.
 */
for (const seed of [1, 2, 3, 4, 5]) {
  test(`busy day #${seed}`, () => {
    const s = setup();
    const random = seededRandom(seed);
    const ids = Array.from({ length: 30 }, (_, i) => `order-${String(i).padStart(2, '0')}`);
    const anyId = () => ids[Math.floor(random() * ids.length)];

    let batch: ImportBatch | null = null;

    for (let step = 0; step < 2000; step++) {
      const roll = random();

      if (roll < 0.3) {
        s.warehouse.setStatus(anyId(), `status-${step}`);
      } else if (roll < 0.55) {
        batch ??= s.importer.startBatch();
        batch.setTotal(anyId(), step);
        if (random() < 0.1) {
          batch = null;
        }
      } else if (roll < 0.8) {
        s.app.sync();
      } else {
        s.clock.advance(random() < 0.9 ? 1 : 5);
      }
    }

    assertAppMatchesDatabase(s);
  });
}
