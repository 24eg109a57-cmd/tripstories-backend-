import assert from "node:assert/strict";
import test from "node:test";
import { mapApiStory } from "./mapApiStory.js";

test("maps a stored API story to the existing feed shape", () => {
  const mapped = mapApiStory({
    id: 7,
    title: "Coastal roads",
    destination: "Goa",
    text: "A slow trip along the coast.",
    authorName: "Traveler",
    authorEmail: "traveler@example.com",
    createdAt: "2026-10-10T12:30:00",
    photos: ["https://images.example/photo.jpg"],
    likes: 3,
    commentCount: 2,
  }, "TRAVELER@example.com");

  assert.equal(mapped.id, 7);
  assert.equal(mapped.location, "Goa");
  assert.equal(mapped.image, "https://images.example/photo.jpg");
  assert.equal(mapped.likes, 3);
  assert.equal(mapped.comments, 2);
  assert.equal(mapped.isMine, true);
  assert.equal(mapped.isRemote, true);
});

test("handles stories with no photos or optional fields", () => {
  const mapped = mapApiStory({ id: 2 }, "");

  assert.deepEqual(mapped.photos, []);
  assert.equal(mapped.image, "");
  assert.equal(mapped.isMine, false);
});
