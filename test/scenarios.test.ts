import { test } from 'node:test';
import { assertAppMatchesDatabase, setup } from './setup.js';

// Times are Unix seconds. NOON = 2026-10-26 12:00:00 UTC.
const NOON = 1_793_016_000;

test('two status changes in the same second', () => {
  const s = setup();

  s.clock.set(NOON);
  s.warehouse.setStatus('B', 'Shipped');
  s.app.sync();
  s.warehouse.setStatus('A', 'Shipped');

  assertAppMatchesDatabase(s);
});

test('the import and the warehouse write in the same second', () => {
  const s = setup();

  s.clock.set(NOON);
  const batch = s.importer.startBatch();
  batch.setTotal('A', 10);
  batch.setTotal('C', 30);
  s.app.sync();
  s.warehouse.setStatus('B', 'Shipped');

  assertAppMatchesDatabase(s);
});

test('a long import batch', () => {
  const s = setup();

  s.clock.set(NOON);
  const batch = s.importer.startBatch();
  batch.setTotal('A', 10);

  s.clock.set(NOON + 3);
  s.warehouse.setStatus('C', 'Shipped');

  s.clock.set(NOON + 10);
  s.app.sync();
  batch.setTotal('B', 20);

  assertAppMatchesDatabase(s);
});
