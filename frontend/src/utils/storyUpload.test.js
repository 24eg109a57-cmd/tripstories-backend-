import assert from "node:assert/strict";
import test from "node:test";
import { createStoryFormData } from "./storyUpload.js";

test("creates a multipart story request with each compressed photo", async () => {
  const formData = createStoryFormData(
    { title: "A trip", destination: "Goa", text: "A story" },
    [
      "data:image/jpeg;base64,YWJj",
      "data:image/jpeg;base64,ZGVm",
    ]
  );

  const story = JSON.parse(await formData.get("story").text());
  const photos = formData.getAll("photos");

  assert.equal(story.title, "A trip");
  assert.equal(photos.length, 2);
  assert.equal(photos[0].type, "image/jpeg");
  assert.equal(photos[0].name, "trip-story-photo-1.jpg");
});

test("rejects unsupported images instead of submitting malformed bytes", () => {
  assert.throws(
    () => createStoryFormData({ title: "A trip" }, ["not-an-image"]),
    /unsupported image format/
  );
});
