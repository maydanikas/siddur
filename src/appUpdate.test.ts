import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkForAppUpdate, watchAppUpdate, type AppUpdateHost, type AppUpdateRegistration } from './appUpdate.ts';

const swUrl = '/sw.js';

function registration(update = async () => {}): AppUpdateRegistration & { updates: number } {
  const record = { installing: null as unknown, updates: 0, update: async () => {} };
  record.update = async () => {
    record.updates += 1;
    await update();
  };
  return record;
}

test('coming back asks the browser for a new version', async () => {
  const reg = registration();
  let fetches = 0;
  const checked = await checkForAppUpdate(swUrl, reg, {
    online: () => true,
    fetch: async (url) => {
      fetches += 1;
      assert.equal(url, swUrl);
      return { status: 200, cancel: async () => {} };
    },
    listen: () => () => {},
  });
  assert.equal(checked, true);
  assert.equal(fetches, 1);
  assert.equal(reg.updates, 1);
});

test('an offline return and a worker already installing do not ask again', async () => {
  let fetches = 0;
  const host: AppUpdateHost = {
    online: () => false,
    fetch: async () => {
      fetches += 1;
      return { status: 200, cancel: async () => {} };
    },
    listen: () => () => {},
  };
  const reg = registration();
  assert.equal(await checkForAppUpdate(swUrl, reg, host), false);
  reg.installing = {};
  host.online = () => true;
  assert.equal(await checkForAppUpdate(swUrl, reg, host), false);
  assert.equal(fetches, 0);
  assert.equal(reg.updates, 0);
});

test('a failed check stays quiet, and a second return waits for the first', async () => {
  const reg = registration();
  let release: () => void = () => {};
  let fetches = 0;
  let onReturn: (() => void) | null = null;
  const stop = watchAppUpdate(swUrl, reg, {
    online: () => true,
    fetch: () => {
      fetches += 1;
      return new Promise((resolve) => {
        release = () => resolve({ status: 500, cancel: async () => {} });
      });
    },
    listen: (callback) => {
      onReturn = callback;
      return () => {
        onReturn = null;
      };
    },
  });

  onReturn?.();
  onReturn?.();
  assert.equal(fetches, 1);
  release();
  await new Promise((resolve) => setTimeout(resolve, 0));
  onReturn?.();
  assert.equal(fetches, 2);
  release();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(reg.updates, 0);

  stop();
  const before = fetches;
  onReturn?.();
  assert.equal(fetches, before);
});
