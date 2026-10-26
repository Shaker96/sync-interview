# Sync interview

Salespeople take orders with a mobile app that also works without internet. The app keeps its own
copy of the orders. From time to time it asks the server for the orders that changed since the last
time it asked, and updates its copy. This is called a **sync**.

Two backend services change orders all day.

**The problem:** sometimes the app shows an old version of an order, and syncing again doesn't fix it.
Reinstalling the app fixes it, for a while. The database always has the right data.

This repo is a small copy of that system. Everything runs in memory: no database or Docker needed.

## Pieces

| file | what it is |
|---|---|
| `src/database.ts` | the orders database |
| `src/services.ts` | the two services that change orders: a **warehouse** service (changes one order's status) and an **import** service (changes order totals in batches) |
| `src/server.ts` | the sync endpoint the app calls |
| `src/app.ts` | the mobile app's sync |
| `src/clock.ts` | the current time; tests use a clock they move by hand |
| `test/scenarios.test.ts` | three short stories that end with the app out of date |
| `test/busy-day.test.ts` | a full day of random activity |

## How a sync works: an example

Times are [Unix timestamps](https://www.unixtimestamp.com/) in seconds, like in the real system.
`1793016000` is 2026-10-26 12:00:00 UTC.

The database has three orders:

| order | updatedAt | time (UTC) |
|---|---|---|
| A | 1793016000 | 12:00:00 |
| B | 1793016000 | 12:00:00 |
| C | 1793016004 | 12:00:04 |

The app has never synced, and it asks for pages of 2 orders. The server sorts orders by `updatedAt`,
then by `id`, and returns the ones **after** the checkpoint: a later `updatedAt`, or the same
`updatedAt` with a greater `id`.

| step | the app sends | the server returns | the app saves the checkpoint |
|---|---|---|---|
| 1 | no checkpoint | A, B | `(1793016000, B)` |
| 2 | `(1793016000, B)` | C | `(1793016004, C)` |
| 3 | `(1793016004, C)` | nothing | (the page was empty: this sync is done) |

At 12:00:09 the warehouse changes order A, so A gets `updatedAt = 1793016009`. In the next sync the app
sends `(1793016004, C)`, and the server returns A, because 1793016009 is later than 1793016004.

That's the whole protocol. The tests in `test/scenarios.test.ts` show cases where it goes wrong;
the first one is the shortest.

## Run it

You need Node 22 or newer.

```bash
npm install
npm test
```

Today all 8 tests fail.

## Your task

1. Find out why the app ends up with old or missing orders.
2. Fix it so the tests pass.

Please think out loud. We care more about how you get there than about how fast.

### Rules (they match the real system)

- `src/app.ts` is an outside library, so you can't change it. It asks for orders starting from its last
  **checkpoint**, page by page, until a page comes back empty. It saves the checkpoint the server sends back.
- Many people use old versions of the app, so `pull` must keep the same inputs and the same response shape.
- You can change the database, the server and the two services.
- Don't change the existing tests. You can add new ones.
