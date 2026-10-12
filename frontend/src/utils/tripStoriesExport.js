const PROFILE_FIELDS = [
  "name",
  "username",
  "email",
  "bio",
  "profileImage",
];

const STORY_FIELDS = [
  "id",
  "title",
  "location",
  "destination",
  "story",
  "text",
  "content",
  "description",
  "photos",
  "image",
  "likes",
  "saved",
  "authorEmail",
  "authorName",
  "createdAt",
];

const COMMENT_FIELDS = [
  "id",
  "author",
  "avatar",
  "text",
  "date",
  "createdAt",
];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pickFields(value, fields) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    fields
      .filter((field) => Object.hasOwn(value, field))
      .map((field) => [field, value[field]])
  );
}

function readJson(storage, key, warnings, fallback) {
  const rawValue = storage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    warnings.push(`${key} is not valid JSON and was excluded.`);
    return fallback;
  }
}

function normalizeStories(value, warnings) {
  if (value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    warnings.push("tripStories was not a list and was excluded.");
    return [];
  }

  const records = value.filter(isRecord);

  if (records.length !== value.length) {
    warnings.push("Some invalid story entries were excluded.");
  }

  return records.map((story) => {
    const result = pickFields(story, STORY_FIELDS);

    if (Array.isArray(story.photos)) {
      result.photos = story.photos.filter(
        (photo) => typeof photo === "string"
      );
    } else if (Object.hasOwn(story, "photos")) {
      result.photos = [];
    }

    if (isRecord(story.author)) {
      result.author = pickFields(story.author, ["name", "email"]);
    } else if (typeof story.author === "string") {
      result.author = story.author;
    }

    return result;
  });
}

function normalizeComments(value, warnings) {
  if (value === undefined) {
    return {};
  }

  if (!isRecord(value)) {
    warnings.push("Stored comments were not an object and were excluded.");
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([storyId, comments]) => {
      if (!Array.isArray(comments)) {
        warnings.push("One invalid comment list was excluded.");
        return [storyId, []];
      }

      const validComments = comments.filter(isRecord);

      if (validComments.length !== comments.length) {
        warnings.push("Some invalid comments were excluded.");
      }

      return [
        storyId,
        validComments.map((comment) => {
          return pickFields(comment, COMMENT_FIELDS);
        }),
      ];
    })
  );
}

function normalizeStringList(value, warnings, label) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    warnings.push(`Stored ${label} data was invalid and was excluded.`);
    return [];
  }

  const normalized = value.filter(
    (item) => typeof item === "string" || typeof item === "number"
  );

  if (normalized.length !== value.length) {
    warnings.push(`Some invalid ${label} entries were excluded.`);
  }

  return normalized;
}

export function createTripStoriesExport(storage, exportedAt = new Date().toISOString()) {
  const warnings = [];
  const currentUser = readJson(storage, "user", warnings, null);
  const storedProfile = readJson(storage, "tripStoriesProfile", warnings, null);
  const storedStories = readJson(storage, "tripStories", warnings, null);
  const storedSocial = readJson(storage, "tripStoriesSocial", warnings, null);

  const profile = {
    ...pickFields(storedProfile, PROFILE_FIELDS),
    ...pickFields(currentUser, PROFILE_FIELDS),
  };
  const stories = normalizeStories(storedStories, warnings);
  const socialData = isRecord(storedSocial) ? storedSocial : {};

  if (storedSocial !== null && !isRecord(storedSocial)) {
    warnings.push("tripStoriesSocial was not an object and was excluded.");
  }

  const userKey = profile.email || profile.username || profile.name;
  const userSocial = userKey && isRecord(socialData[userKey])
    ? socialData[userKey]
    : {};

  if (userKey && socialData[userKey] !== undefined && !isRecord(socialData[userKey])) {
    warnings.push("The signed-in user's social data was invalid and was excluded.");
  }

  const comments = normalizeComments(socialData.comments, warnings);
  const likedStories = normalizeStringList(
    userSocial.likedStories,
    warnings,
    "liked-story"
  );
  const following = normalizeStringList(
    userSocial.following,
    warnings,
    "following"
  );
  const followers = normalizeStringList(
    userSocial.followers,
    warnings,
    "follower"
  );
  const savedStories = stories
    .filter((story) => story.saved === true)
    .map((story) => story.id)
    .filter((id) => id !== undefined && id !== null);

  const hasSocialData =
    likedStories.length > 0 ||
    following.length > 0 ||
    followers.length > 0 ||
    Object.values(comments).some((items) => items.length > 0);

  if (
    Object.keys(profile).length === 0 &&
    stories.length === 0 &&
    !hasSocialData
  ) {
    throw new Error("No profile, story, or social data was found to export.");
  }

  return {
    data: {
      format: "tripstories-local-data",
      version: 1,
      exportedAt,
      profile,
      stories,
      social: {
        likedStories,
        following,
        followers,
        savedStories,
        comments,
      },
    },
    warnings,
    counts: {
      stories: stories.length,
      likedStories: likedStories.length,
      following: following.length,
      followers: followers.length,
      comments: Object.values(comments).reduce(
        (total, items) => total + items.length,
        0
      ),
      savedStories: savedStories.length,
    },
  };
}
