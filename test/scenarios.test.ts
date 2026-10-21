import { test } from 'node:test';
import { assertAppMatchesDatabase, setup } from './setup.js';

test('two status changes in the same second', () => {
  const s = setup();

  s.clock.set(1000);
  s.warehouse.setStatus('B', 'Shipped');
  s.app.sync();
  s.warehouse.setStatus('A', 'Shipped');

  assertAppMatchesDatabase(s);
});

test('the import and the warehouse write in the same second', () => {
  const s = setup();

  s.clock.set(1000);
  const batch = s.importer.startBatch();
  batch.setTotal('A', 10);
  batch.setTotal('C', 30);
  s.app.sync();
  s.warehouse.setStatus('B', 'Shipped');

  assertAppMatchesDatabase(s);
});

test('a long import batch', () => {
  const s = setup();

  s.clock.set(1000);
  const batch = s.importer.startBatch();
  batch.setTotal('A', 10);

  s.clock.set(1003);
  s.warehouse.setStatus('C', 'Shipped');

  s.clock.set(1010);
  s.app.sync();
  batch.setTotal('B', 20);

  assertAppMatchesDatabase(s);
});
