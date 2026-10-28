import { test } from 'node:test';
import { assertAppMatchesDatabase, setup } from './setup.js';

// Times are Unix seconds. NOON = 2026-10-26 12:00:00 UTC.
const NOON = 1_793_016_000;

test('two status changes in the same second', () => {
  const s = setup();

  s.clock.set(NOON);
  s.warehouse.setStatus(102, 'Shipped');
  s.app.sync();
  s.warehouse.setStatus(101, 'Shipped');

  assertAppMatchesDatabase(s);
});

test('the import and the warehouse write in the same second', () => {
  const s = setup();

  s.clock.set(NOON);
  const batch = s.importer.startBatch();
  batch.setTotal(101, 10);
  batch.setTotal(103, 30);
  s.app.sync();
  s.warehouse.setStatus(102, 'Shipped');

  assertAppMatchesDatabase(s);
});

test('a long import batch', () => {
  const s = setup();

  s.clock.set(NOON);
  const batch = s.importer.startBatch();
  batch.setTotal(101, 10);

  s.clock.set(NOON + 3);
  s.warehouse.setStatus(103, 'Shipped');

  s.clock.set(NOON + 10);
  s.app.sync();
  batch.setTotal(102, 20);

  assertAppMatchesDatabase(s);
});
