import assert from "node:assert/strict";
import test from "node:test";

import { createTripStoriesExport } from "./tripStoriesExport.js";

class MemoryStorage {
  #values;

  constructor(entries) {
    this.#values = new Map(entries);
  }

  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  snapshot() {
    return JSON.stringify([...this.#values.entries()]);
  }
}

test("export JSON includes profile, stories, photos, and social data without secrets", () => {
  const storage = new MemoryStorage([
    ["user", JSON.stringify({ name: "Traveler", email: "traveler@example.com" })],
    ["tripStoriesProfile", JSON.stringify({ name: "Saved Name", bio: "A bio" })],
    [
      "tripStories",
      JSON.stringify([
        {
          id: "story-1",
          title: "Coast trip",
          photos: ["data:image/jpeg;base64,abc"],
          saved: true,
        },
      ]),
    ],
    [
      "tripStoriesSocial",
      JSON.stringify({
        "traveler@example.com": {
          likedStories: ["story-2"],
          following: ["friend@example.com"],
          followers: ["other@example.com"],
        },
        comments: {
          "story-1": [{ id: "comment-1", author: "Friend", text: "Lovely!" }],
        },
      }),
    ],
    [
      "tripStoriesUsers",
      JSON.stringify([{ email: "traveler@example.com", password: "do-not-export" }]),
    ],
    ["tripStoriesToken", "sensitive-token"],
    ["authToken", "another-token"],
  ]);
  const before = storage.snapshot();

  const result = createTripStoriesExport(storage, "2026-10-11T00:00:00.000Z");
  const downloadedJson = JSON.stringify(result.data);
  const parsed = JSON.parse(downloadedJson);

  assert.equal(parsed.profile.email, "traveler@example.com");
  assert.equal(parsed.profile.name, "Traveler");
  assert.equal(parsed.stories[0].photos[0], "data:image/jpeg;base64,abc");
  assert.deepEqual(parsed.social.likedStories, ["story-2"]);
  assert.deepEqual(parsed.social.following, ["friend@example.com"]);
  assert.equal(parsed.social.comments["story-1"][0].text, "Lovely!");
  assert.deepEqual(parsed.social.savedStories, ["story-1"]);
  assert.doesNotMatch(downloadedJson, /do-not-export|sensitive-token|another-token/);
  assert.doesNotMatch(downloadedJson, /tripStoriesUsers|tripStoriesToken|authToken/);
  assert.equal(storage.snapshot(), before);
});

test("invalid and missing stored values produce a partial export without mutating storage", () => {
  const storage = new MemoryStorage([
    ["user", "{invalid"],
    ["tripStories", JSON.stringify([{ id: "story-1", title: "A story" }])],
    ["tripStoriesSocial", JSON.stringify({ comments: "invalid" })],
  ]);
  const before = storage.snapshot();

  const result = createTripStoriesExport(storage);

  assert.equal(result.data.stories.length, 1);
  assert.ok(result.warnings.length > 0);
  assert.equal(storage.snapshot(), before);
});

test("export fails clearly when there is no available user data", () => {
  const storage = new MemoryStorage([]);

  assert.throws(
    () => createTripStoriesExport(storage),
    /No profile, story, or social data was found to export/
  );
});
