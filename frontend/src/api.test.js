import assert from "node:assert/strict";
import test from "node:test";

import {
  apiRequest,
  hasValidAccessToken,
  saveAuthSession,
} from "./api.js";

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.get(key) ?? null;
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }

  removeItem(key) {
    this.#values.delete(key);
  }
}

async function withBrowserGlobals(callback) {
  const previous = {
    sessionStorage: globalThis.sessionStorage,
    localStorage: globalThis.localStorage,
    window: globalThis.window,
    fetch: globalThis.fetch,
  };
  const sessionStorage = new MemoryStorage();
  const localStorage = new MemoryStorage();
  const dispatchedEvents = [];

  globalThis.sessionStorage = sessionStorage;
  globalThis.localStorage = localStorage;
  globalThis.window = {
    dispatchEvent: (event) => dispatchedEvents.push(event.type),
  };

  try {
    await callback({ sessionStorage, localStorage, dispatchedEvents });
  } finally {
    globalThis.sessionStorage = previous.sessionStorage;
    globalThis.localStorage = previous.localStorage;
    globalThis.window = previous.window;
    globalThis.fetch = previous.fetch;
  }
}

test("saves the access token only in session storage and checks expiry", async () => {
  await withBrowserGlobals(async ({ sessionStorage, localStorage }) => {
    const claims = btoa(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 60,
    }));
    const token = `header.${claims}.signature`;

    saveAuthSession({
      accessToken: token,
      user: { id: 4, username: "Traveler", email: "traveler@example.com" },
    });

    assert.equal(sessionStorage.getItem("tripStoriesAccessToken"), token);
    assert.equal(
      JSON.parse(sessionStorage.getItem("tripStoriesSessionUser")).name,
      "Traveler"
    );
    assert.equal(hasValidAccessToken(), true);
    assert.equal(localStorage.getItem("tripStoriesAccessToken"), null);
  });
});

test("sends bearer credentials to protected APIs without touching local storage", async () => {
  await withBrowserGlobals(async ({ sessionStorage, localStorage }) => {
    sessionStorage.setItem("tripStoriesAccessToken", "test-access-token");
    localStorage.setItem("tripStories", "preserved");
    let requestHeaders;

    globalThis.fetch = async (_url, options) => {
      requestHeaders = new Headers(options.headers);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const response = await apiRequest("/api/users/4");

    assert.equal(response.ok, true);
    assert.equal(
      requestHeaders.get("Authorization"),
      "Bearer test-access-token"
    );
    assert.equal(localStorage.getItem("tripStories"), "preserved");
  });
});

test("clears only session auth state when a protected request returns 401", async () => {
  await withBrowserGlobals(async ({
    sessionStorage,
    localStorage,
    dispatchedEvents,
  }) => {
    sessionStorage.setItem("tripStoriesAccessToken", "expired-access-token");
    sessionStorage.setItem(
      "tripStoriesSessionUser",
      JSON.stringify({ email: "traveler@example.com" })
    );
    localStorage.setItem("user", "legacy-profile");
    localStorage.setItem("tripStoriesUsers", "legacy-accounts");

    globalThis.fetch = async () => new Response(null, { status: 401 });

    await assert.rejects(
      apiRequest("/api/users/4"),
      /sign-in has expired/
    );

    assert.equal(sessionStorage.getItem("tripStoriesAccessToken"), null);
    assert.equal(sessionStorage.getItem("tripStoriesSessionUser"), null);
    assert.equal(localStorage.getItem("user"), "legacy-profile");
    assert.equal(localStorage.getItem("tripStoriesUsers"), "legacy-accounts");
    assert.deepEqual(dispatchedEvents, ["tripstories-auth"]);
  });
});
