import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { stories as homeStories } from "./Home";
import { Link, useLocation } from "react-router-dom";
import { apiRequest, hasValidAccessToken } from "../api";
import { mapApiStory } from "../utils/mapApiStory";
import "../styles/inspired-stories.css";

/* =========================================================
   DEMO NAMES
========================================================= */

const DEMO_NAMES = [
  "Maya",
  "Aarav",
  "Sofia",
  "Riya",
  "Kabir",
  "Anaya",
  "Vihaan",
  "Ishita",
  "Arjun",
  "Meera",
  "Naina",
  "Aditya",
  "Tara",
  "Dev",
  "Kiara",
  "Rohan",
  "Aisha",
  "Neel",
];

function getDemoNameMap() {
  const storageKey = "tripStoriesDemoNames";

  try {
    const existing = JSON.parse(
      localStorage.getItem(storageKey) || "{}"
    );

    if (existing && typeof existing === "object") {
      return existing;
    }
  } catch {
    // Create a fresh demo-name map below.
  }

  const shuffled = [...DEMO_NAMES].sort(
    () => Math.random() - 0.5
  );

  const map = {};

  shuffled.forEach((name, index) => {
    map[`demo-${index + 1}`] = name;
  });

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(map)
    );
  } catch {
    // Demo names can still be generated in memory.
  }

  return map;
}

function getRandomDemoName(storyId, fallbackIndex = 0) {
  const map = getDemoNameMap();
  const key = `story-${storyId}`;

  if (map[key]) {
    return map[key];
  }

  const usedNames = Object.values(map);

  const available = DEMO_NAMES.filter(
    (name) => !usedNames.includes(name)
  );

  const name =
    available[fallbackIndex % Math.max(available.length, 1)] ||
    DEMO_NAMES[fallbackIndex % DEMO_NAMES.length];

  map[key] = name;

  try {
    localStorage.setItem(
      "tripStoriesDemoNames",
      JSON.stringify(map)
    );
  } catch {
    // Ignore storage errors.
  }

  return name;
}

/* =========================================================
   SAMPLE STORIES
========================================================= */

const sampleStories = [
  {
    id: "story-1",
    author: "Maya",
    authorEmail: "maya@example.com",
    avatar: "M",
    location: "Paris, France",
    date: "2 days ago",
    title: "A weekend that felt like a movie",
    text:
      "Paris was everything I imagined and somehow even better. We spent our mornings walking through tiny streets, stopping at cafés and watching the city wake up.",
    photos: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
    likes: 248,
    comments: 32,
    saved: false,
    isMine: false,
  },

  {
    id: "story-2",
    author: "Aarav",
    authorEmail: "aarav@example.com",
    avatar: "A",
    location: "Manali, India",
    date: "4 days ago",
    title: "Lost somewhere in the mountains",
    text:
      "No plans. No alarm. Just cold mornings, mountain roads and a cup of chai with the best view I've ever seen.",
    photos: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    likes: 391,
    comments: 46,
    saved: false,
    isMine: false,
  },

  {
    id: "story-3",
    author: "Sofia",
    authorEmail: "sofia@example.com",
    avatar: "S",
    location: "Santorini, Greece",
    date: "1 week ago",
    title: "The bluest kind of escape",
    text:
      "We came for the sunset but stayed for everything else. Santorini made slowing down feel like the most exciting thing in the world.",
    photos: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85",
    likes: 512,
    comments: 71,
    saved: false,
    isMine: false,
  },
];

/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {
  try {
    const sessionUser = JSON.parse(
      sessionStorage.getItem("tripStoriesSessionUser") || "null"
    );

    if (sessionUser && typeof sessionUser === "object") {
      return sessionUser;
    }
  } catch {
    // Continue with preserved legacy profile data below.
  }

  const keys = ["user", "auraUser", "currentUser"];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);

      if (!value) continue;

      const parsed = JSON.parse(value);

      if (parsed && typeof parsed === "object") {
        return parsed.user && typeof parsed.user === "object"
          ? parsed.user
          : parsed;
      }

      if (typeof parsed === "string" && parsed.trim()) {
        return { name: parsed.trim() };
      }
    } catch {
      // Try the next possible user storage key.
    }
  }

  return null;
}

/* =========================================================
   CURRENT USER NAME
========================================================= */

function getCurrentUserName() {
  const user = getCurrentUser();

  return (
    user?.name ||
    user?.displayName ||
    user?.fullName ||
    user?.username ||
    user?.userName ||
    user?.email ||
    "Traveler"
  );
}

function getCurrentUserEmail() {
  const user = getCurrentUser();

  return user?.email || user?.mail || "";
}

/* =========================================================
   COMMENT HELPERS
========================================================= */

/*
  Get the actual comments stored for a story.
*/
function getStoredComments(storyId) {
  try {
    const social = JSON.parse(
      localStorage.getItem("tripStoriesSocial") || "{}"
    );

    if (
      social.comments &&
      Array.isArray(social.comments[storyId])
    ) {
      return social.comments[storyId];
    }

    return [];
  } catch {
    return [];
  }
}

/*
  Format the actual comment date and time.

  Example:

  Saturday, 19 September 2026 • 8:42 PM
*/
function formatCommentDate(comment) {
  let timestamp = comment?.createdAt;

  /*
    Older comments from the previous version did not have
    createdAt, but their IDs were generated using Date.now():

    comment-1758250000000-abc123

    So recover the timestamp from the comment ID.
  */
  if (!timestamp && comment?.id) {
    const match = String(comment.id).match(
      /^comment-(\d+)/
    );

    if (match) {
      timestamp = Number(match[1]);
    }
  }

  /*
    If an old comment has neither createdAt nor a timestamp
    inside its ID, keep its old date value.
  */
  if (!timestamp) {
    return comment?.date || "Date unavailable";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return comment?.date || "Date unavailable";
  }

  return date
    .toLocaleString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" at ", " • ");
}

/* =========================================================
   USER STORIES
========================================================= */

function getUserStories() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("tripStories") || "[]"
    );

    if (!Array.isArray(saved)) {
      return [];
    }

    const currentUserName = getCurrentUserName();
    const currentUserEmail = getCurrentUserEmail();

    // The current user has only one published story on this demo feed.
    // If older test stories exist in localStorage, keep only the newest one.
    const latestStory = saved[saved.length - 1];

    if (!latestStory) {
      return [];
    }

    return [latestStory].map((story) => {
      /*
        Every story stored in `tripStories` is a story created by
        the currently logged-in user. Use the live profile name
        here so an old story saved with "Traveler" does not keep
        showing that placeholder.
      */
      const rawAuthorName =
        currentUserName !== "Traveler"
          ? currentUserName
          : story.author?.name ||
            story.author?.username ||
            story.author ||
            "Traveler";

      // Do not let the old demo/test name "pinkey" appear on the feed.
      const authorName =
        rawAuthorName.trim().toLowerCase() === "pinkey"
          ? "You"
          : rawAuthorName;

      let photos = [];

      if (Array.isArray(story.photos)) {
        photos = story.photos.filter(Boolean);
      }

      if (photos.length === 0 && story.image) {
        photos = [story.image];
      }

      /*
        FIX:
        Get the real comments from tripStoriesSocial.
      */
      const realComments = getStoredComments(
        story.id
      );

      return {
        id: story.id || "user-story-latest",

        author: authorName,

        authorEmail:
          currentUserEmail ||
          story.author?.email ||
          story.authorEmail ||
          "",

        avatar:
          story.avatar ||
          authorName.charAt(0).toUpperCase(),

        location:
          story.destination ||
          story.location ||
          "Travel destination",

        date: story.createdAt
          ? new Date(
              story.createdAt
            ).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )
          : "Recently",

        title:
          story.title ||
          "My travel story",

        text:
          story.story ||
          story.content ||
          story.text ||
          story.description ||
          "A journey worth remembering.",

        photos,

        image:
          photos[0] ||
          "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",

        likes:
          Number(story.likes) || 0,

        /*
          IMPORTANT:
          Use the actual number of stored comments.
        */
        comments:
          realComments.length,

        saved:
          Boolean(story.saved),

        /*
          Used internally only for
          delete/follow logic.
        */
        isMine: true,

        originalStory: story,
      };
    });
  } catch (error) {
    console.error(
      "Error loading stories:",
      error
    );

    return [];
  }
}

/* =========================================================
   LOAD ALL STORIES
========================================================= */

function loadAllStories() {
  const demoNames = getDemoNameMap();

  const preparedHomeStories = homeStories.map((story, index) => {
    const demoAuthor =
      demoNames[`story-home-${story.id}`] ||
      getRandomDemoName(`home-${story.id}`, index);

    return {
      ...story,
      id: `home-${story.id}`,
      author: demoAuthor,
      authorEmail: `${demoAuthor.toLowerCase().replace(/\s+/g, ".")}@tripstories.demo`,
      avatar: demoAuthor.charAt(0).toUpperCase(),
      date: story.date || "Recently",
      text:
        story.text ||
        story.description ||
        "A journey worth remembering.",
      photos:
        Array.isArray(story.photos) &&
        story.photos.length
          ? story.photos
          : [story.image],
      likes:
        Number(story.likes) || 0,
      comments:
        Number(story.comments) || 0,
      saved:
        Boolean(story.saved),
      isMine: false,
    };
  });

  const preparedSampleStories = sampleStories.map(
    (story, index) => {
      const demoAuthor =
        demoNames[`story-${story.id}`] ||
        getRandomDemoName(
          story.id,
          index + homeStories.length
        );

      return {
        ...story,
        author: demoAuthor,
        authorEmail: `${demoAuthor.toLowerCase().replace(/\s+/g, ".")}@tripstories.demo`,
        avatar: demoAuthor.charAt(0).toUpperCase(),
        isMine: false,
      };
    }
  );

  return [
    ...getUserStories(),
    ...preparedHomeStories,
    ...preparedSampleStories,
  ];
}

/* =========================================================
   SOCIAL DATA
========================================================= */

function getSocialData() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "tripStoriesSocial"
      ) || "{}"
    );
  } catch {
    return {};
  }
}

function saveSocialData(data) {
  localStorage.setItem(
    "tripStoriesSocial",
    JSON.stringify(data)
  );

  window.dispatchEvent(
    new Event("tripSocialUpdated")
  );
}

function getCommentsForStory(storyId) {
  const social = getSocialData();
  return Array.isArray(social.comments?.[storyId])
    ? social.comments[storyId]
    : [];
}

/* =========================================================
   COMPONENT
========================================================= */

function InspiredStories() {
  const location = useLocation();

  const [stories, setStories] =
    useState(loadAllStories);

  const [activeFilter, setActiveFilter] =
    useState("Latest");

  const [search, setSearch] =
    useState("");

  const [likedStories, setLikedStories] = useState(() => {
    const user = getCurrentUser();
    const key = user?.email || user?.name || user?.username;
    const profile = key ? getSocialData()[key] : null;
    return Array.isArray(profile?.likedStories) ? profile.likedStories : [];
  });

  const [followedUsers, setFollowedUsers] = useState(() => {
    const user = getCurrentUser();
    const key = user?.email || user?.name || user?.username;
    const profile = key ? getSocialData()[key] : null;
    return Array.isArray(profile?.following) ? profile.following : [];
  });

  const [selectedStory, setSelectedStory] =
    useState(null);

  const handledHomeStory = useRef(null);

  const [currentPhoto, setCurrentPhoto] =
    useState(0);

  const [commentText, setCommentText] =
    useState("");

  const [storyComments, setStoryComments] =
    useState([]);

  const [feedMessage, setFeedMessage] =
    useState("");

  const [followingRecords, setFollowingRecords] =
    useState([]);

  const filters = [
    "Latest",
    "Popular",
    "Saved",
  ];

  /* =======================================================
     LOAD SOCIAL STATE
  ======================================================= */

  const loadSocialState = useCallback(() => {
    const user = getCurrentUser();

    if (!user) {
      setLikedStories([]);
      setFollowedUsers([]);
      return;
    }

    const key =
      user.email ||
      user.name ||
      user.username;

    const social = getSocialData();

    const profile =
      social[key] || {};

    setLikedStories(
      Array.isArray(
        profile.likedStories
      )
        ? profile.likedStories
        : []
    );

    setFollowedUsers(
      Array.isArray(
        profile.following
      )
        ? profile.following
        : []
    );

    if (!hasValidAccessToken()) {
      setFollowingRecords([]);
      return;
    }

    Promise.all([
      apiRequest("/api/social/likes"),
      apiRequest("/api/social/saved"),
      apiRequest(`/api/social/following/${encodeURIComponent(user.email)}`),
    ])
      .then(([remoteLikes, remoteSaved, remoteFollowing]) => {
        const likedIds = Array.isArray(remoteLikes) ? remoteLikes : [];
        const savedIds = Array.isArray(remoteSaved) ? remoteSaved : [];
        const followRecords = Array.isArray(remoteFollowing)
          ? remoteFollowing
          : [];

        setLikedStories((current) => [
          ...new Set([...current, ...likedIds]),
        ]);
        setFollowedUsers((current) => [
          ...new Set([
            ...current,
            ...followRecords.map((record) => record.followingEmail),
          ]),
        ]);
        setFollowingRecords(followRecords);
        setStories((current) =>
          current.map((story) => (
            story.isRemote
              ? { ...story, saved: savedIds.includes(story.id) }
              : story
          ))
        );
      })
      .catch((error) => {
        console.error("Could not load account social data:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not load your social information."
        );
      });
  }, []);

  const refreshRemoteStories = useCallback(async () => {
    try {
      const remoteStories = await apiRequest("/api/stories");
      if (!Array.isArray(remoteStories)) {
        throw new Error("The server returned an invalid story list.");
      }

      const currentUser = getCurrentUser();
      const mappedStories = remoteStories.map((story) =>
        mapApiStory(story, currentUser?.email || "")
      );
      setStories([...loadAllStories(), ...mappedStories]);
      loadSocialState();
      setFeedMessage("");
    } catch (error) {
      console.error("Could not load shared stories:", error);
      setFeedMessage(
        error instanceof Error
          ? error.message
          : "Could not load shared stories from the server."
      );
    }
  }, [loadSocialState]);

  /* =======================================================
     REFRESH STORIES
  ======================================================= */

  useEffect(() => {
    let active = true;

    apiRequest("/api/stories")
      .then((remoteStories) => {
        if (!active) {
          return;
        }
        if (!Array.isArray(remoteStories)) {
          throw new Error("The server returned an invalid story list.");
        }

        const currentUser = getCurrentUser();
        const mappedStories = remoteStories.map((story) =>
          mapApiStory(story, currentUser?.email || "")
        );
        setStories([...loadAllStories(), ...mappedStories]);
        loadSocialState();
        setFeedMessage("");
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        console.error("Could not load shared stories:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not load shared stories from the server."
        );
      });

    return () => {
      active = false;
    };
  }, [loadSocialState]);

  useEffect(() => {
    const refresh = () => {
      setStories((current) => [
        ...loadAllStories(),
        ...current.filter((story) => story.isRemote),
      ]);
      refreshRemoteStories();

      if (selectedStory) {
        if (selectedStory.isRemote) {
          apiRequest(`/api/comments/story/${selectedStory.id}`)
            .then((comments) => {
              if (Array.isArray(comments)) {
                setStoryComments(comments.map((comment) => ({
                  ...comment,
                  createdAt: Number(comment.date) || undefined,
                })));
              }
            })
            .catch((error) => {
              console.error("Could not refresh story comments:", error);
            });
        } else {
          setStoryComments(getCommentsForStory(selectedStory.id));
        }
      }
    };

    window.addEventListener(
      "focus",
      refresh
    );

    window.addEventListener(
      "storage",
      refresh
    );

    window.addEventListener(
      "tripStoryUpdated",
      refresh
    );

    window.addEventListener(
      "tripSocialUpdated",
      refresh
    );

    return () => {
      window.removeEventListener(
        "focus",
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );

      window.removeEventListener(
        "tripStoryUpdated",
        refresh
      );

      window.removeEventListener(
        "tripSocialUpdated",
        refresh
      );
    };
  }, [selectedStory, refreshRemoteStories]);

  /* =======================================================
     FILTER STORIES
  ======================================================= */

  const visibleStories =
    useMemo(() => {
      let result = [...stories];

      /* POPULAR */

      if (
        activeFilter === "Popular"
      ) {
        const POPULAR_LIKE_LIMIT = 10;

        result = result
          .filter(
            (story) =>
              Number(
                story.likes
              ) >=
              POPULAR_LIKE_LIMIT
          )
          .sort(
            (a, b) =>
              Number(b.likes) -
              Number(a.likes)
          );
      }

      /* SAVED */

      if (
        activeFilter === "Saved"
      ) {
        result =
          result.filter(
            (story) =>
              story.saved
          );
      }

      /* SEARCH */

      const query =
        search
          .trim()
          .toLowerCase();

      if (query) {
        result =
          result.filter(
            (story) =>
              story.title
                .toLowerCase()
                .includes(query) ||
              story.text
                .toLowerCase()
                .includes(query) ||
              story.author
                .toLowerCase()
                .includes(query) ||
              story.location
                .toLowerCase()
                .includes(query)
          );
      }

      return result;
    }, [
      stories,
      activeFilter,
      search,
    ]);

  /* =======================================================
     UPDATE USER STORY
  ======================================================= */

  const updateStoredStory = (
    id,
    callback
  ) => {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            "tripStories"
          ) || "[]"
        );

      const updated =
        saved.map(
          (story) =>
            story.id === id
              ? callback(story)
              : story
        );

      localStorage.setItem(
        "tripStories",
        JSON.stringify(
          updated
        )
      );
    } catch (error) {
      console.error(
        "Could not update story:",
        error
      );
    }
  };

  /* =======================================================
     POST COMMENT
  ======================================================= */

  const postComment = async () => {
    const text =
      commentText.trim();

    if (
      !text ||
      !selectedStory
    ) {
      return;
    }

    if (selectedStory.isRemote) {
      if (!hasValidAccessToken()) {
        setFeedMessage("Sign in to comment on shared stories.");
        return;
      }

      try {
        const comment = await apiRequest(
          `/api/comments/story/${selectedStory.id}`,
          {
            method: "POST",
            body: JSON.stringify({ text }),
          }
        );
        const mappedComment = {
          ...comment,
          createdAt: Number(comment.date) || Date.now(),
        };
        const updatedComments = [...storyComments, mappedComment];

        setStoryComments(updatedComments);
        setStories((current) =>
          current.map((story) => (
            story.id === selectedStory.id
              ? { ...story, comments: updatedComments.length }
              : story
          ))
        );
        setSelectedStory((current) =>
          current
            ? { ...current, comments: updatedComments.length }
            : current
        );
        setCommentText("");
        setFeedMessage("");
        return;
      } catch (error) {
        console.error("Could not post comment:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not post your comment."
        );
        return;
      }
    }

    const user =
      getCurrentUser();

    const author =
      user?.name ||
      user?.username ||
      user?.email ||
      "You";

    /*
      Store the exact posting timestamp.
    */
    const now = Date.now();

    const newComment = {
      id: `comment-${now}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      author,

      avatar:
        author
          .charAt(0)
          .toUpperCase(),

      text,

      /*
        REAL DATE + TIME
      */
      createdAt: now,
    };

    const social =
      getSocialData();

    if (!social.comments) {
      social.comments = {};
    }

    if (
      !Array.isArray(
        social.comments[
          selectedStory.id
        ]
      )
    ) {
      social.comments[
        selectedStory.id
      ] = [];
    }

    social.comments[
      selectedStory.id
    ] = [
      ...social.comments[
        selectedStory.id
      ],
      newComment,
    ];

    saveSocialData(social);

    const updatedComments =
      social.comments[
        selectedStory.id
      ];

    /*
      Update the visible comments.
    */
    setStoryComments(
      updatedComments
    );

    /*
      IMPORTANT:
      Count the actual comments.
    */
    const newCommentCount =
      updatedComments.length;

    setStories(
      (current) =>
        current.map(
          (story) =>
            story.id ===
            selectedStory.id
              ? {
                  ...story,
                  comments:
                    newCommentCount,
                }
              : story
        )
    );

    setSelectedStory(
      (current) =>
        current
          ? {
              ...current,
              comments:
                newCommentCount,
            }
          : current
    );

    updateStoredStory(
      selectedStory.id,
      (story) => ({
        ...story,
        comments:
          updatedComments,
      })
    );

    setCommentText("");

    window.dispatchEvent(
      new Event(
        "tripStoryUpdated"
      )
    );
  };

  /* =======================================================
     LIKE
  ======================================================= */

  const toggleLike = async (id) => {
    const targetStory = stories.find((story) => story.id === id);
    if (targetStory?.isRemote) {
      if (!hasValidAccessToken()) {
        setFeedMessage("Sign in to like shared stories.");
        return;
      }

      try {
        const updatedStory = await apiRequest(
          `/api/social/like/${id}`,
          { method: "POST" }
        );
        const nextLiked = !likedStories.includes(id);

        setLikedStories((current) => (
          nextLiked
            ? [...new Set([...current, id])]
            : current.filter((storyId) => storyId !== id)
        ));
        setStories((current) =>
          current.map((story) => (
            story.id === id
              ? { ...story, likes: Number(updatedStory.likes) || 0 }
              : story
          ))
        );
        setSelectedStory((current) => (
          current?.id === id
            ? { ...current, likes: Number(updatedStory.likes) || 0 }
            : current
        ));
        setFeedMessage("");
      } catch (error) {
        console.error("Could not update story like:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not update your like."
        );
      }
      return;
    }

    const user =
      getCurrentUser();

    const userKey =
      user?.email ||
      user?.name ||
      user?.username ||
      "guest";

    const social =
      getSocialData();

    if (!social[userKey]) {
      social[userKey] = {
        followers: [],
        following: [],
        likedStories: [],
      };
    }

    const currentLikes =
      Array.isArray(
        social[userKey]
          .likedStories
      )
        ? social[userKey]
            .likedStories
        : [];

    const alreadyLiked =
      currentLikes.includes(id);

    const newLikedStories =
      alreadyLiked
        ? currentLikes.filter(
            (storyId) =>
              storyId !== id
          )
        : [
            ...currentLikes,
            id,
          ];

    social[userKey]
      .likedStories =
      newLikedStories;

    saveSocialData(social);

    setLikedStories(
      newLikedStories
    );

    setStories(
      (current) =>
        current.map(
          (story) => {
            if (
              story.id !== id
            ) {
              return story;
            }

            return {
              ...story,

              likes:
                alreadyLiked
                  ? Math.max(
                      0,
                      story.likes -
                        1
                    )
                  : story.likes +
                    1,
            };
          }
        )
    );

    updateStoredStory(
      id,
      (story) => {
        const likes =
          Number(
            story.likes
          ) || 0;

        const existingLikedBy =
          Array.isArray(
            story.likedBy
          )
            ? story.likedBy
            : [];

        let newLikedBy;

        if (alreadyLiked) {
          newLikedBy =
            existingLikedBy.filter(
              (email) =>
                email !==
                userKey
            );
        } else {
          newLikedBy =
            existingLikedBy.includes(
              userKey
            )
              ? existingLikedBy
              : [
                  ...existingLikedBy,
                  userKey,
                ];
        }

        return {
          ...story,

          likes:
            alreadyLiked
              ? Math.max(
                  0,
                  likes - 1
                )
              : likes + 1,

          likedBy:
            newLikedBy,
        };
      }
    );

    setSelectedStory(
      (current) => {
        if (
          !current ||
          current.id !== id
        ) {
          return current;
        }

        return {
          ...current,

          likes:
            alreadyLiked
              ? Math.max(
                  0,
                  current.likes -
                    1
                )
              : current.likes +
                1,
        };
      }
    );

    window.dispatchEvent(
      new Event(
        "tripStoryUpdated"
      )
    );
  };

  /* =======================================================
     FOLLOW
  ======================================================= */

  const toggleFollow = async (
    story
  ) => {
    const user =
      getCurrentUser();

    const currentUserKey =
      user?.email ||
      user?.name ||
      user?.username ||
      "guest";

    const targetKey =
      story.authorEmail ||
      story.author;

    if (
      currentUserKey ===
      targetKey
    ) {
      return;
    }

    if (story.isRemote) {
      if (!hasValidAccessToken()) {
        setFeedMessage("Sign in to follow TripStories members.");
        return;
      }

      const existingFollow = followingRecords.find(
        (record) =>
          record.followingEmail?.toLowerCase() ===
          String(targetKey).toLowerCase()
      );
      try {
        if (existingFollow) {
          await apiRequest(
            `/api/social/unfollow/${existingFollow.id}`,
            { method: "DELETE" }
          );
          setFollowingRecords((current) =>
            current.filter((record) => record.id !== existingFollow.id)
          );
          setFollowedUsers((current) =>
            current.filter(
              (email) => email.toLowerCase() !== String(targetKey).toLowerCase()
            )
          );
        } else {
          const createdFollow = await apiRequest("/api/social/follow", {
            method: "POST",
            body: JSON.stringify({ followingEmail: targetKey }),
          });
          setFollowingRecords((current) => [...current, createdFollow]);
          setFollowedUsers((current) => [...new Set([...current, targetKey])]);
        }
        setFeedMessage("");
      } catch (error) {
        console.error("Could not update follow:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not update your follow."
        );
      }
      return;
    }

    const social =
      getSocialData();

    if (
      !social[currentUserKey]
    ) {
      social[currentUserKey] =
        {
          followers: [],
          following: [],
          likedStories: [],
        };
    }

    if (!social[targetKey]) {
      social[targetKey] = {
        followers: [],
        following: [],
        likedStories: [],
      };
    }

    const following =
      social[
        currentUserKey
      ].following || [];

    const alreadyFollowing =
      following.includes(
        targetKey
      );

    if (
      alreadyFollowing
    ) {
      social[
        currentUserKey
      ].following =
        following.filter(
          (item) =>
            item !== targetKey
        );

      social[targetKey]
        .followers =
        (
          social[targetKey]
            .followers || []
        ).filter(
          (item) =>
            item !==
            currentUserKey
        );
    } else {
      social[
        currentUserKey
      ].following = [
        ...following,
        targetKey,
      ];

      const followers =
        social[targetKey]
          .followers || [];

      if (
        !followers.includes(
          currentUserKey
        )
      ) {
        social[targetKey]
          .followers = [
            ...followers,
            currentUserKey,
          ];
      }
    }

    saveSocialData(social);

    setFollowedUsers(
      social[currentUserKey]
        .following
    );
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const toggleSave = async (id) => {
    const targetStory = stories.find((story) => story.id === id);
    if (targetStory?.isRemote) {
      if (!hasValidAccessToken()) {
        setFeedMessage("Sign in to save shared stories.");
        return;
      }

      try {
        const willSave = !targetStory.saved;
        await apiRequest(
          `/api/social/saved/${id}`,
          { method: willSave ? "PUT" : "DELETE" }
        );
        setStories((current) =>
          current.map((story) => (
            story.id === id ? { ...story, saved: willSave } : story
          ))
        );
        setSelectedStory((current) => (
          current?.id === id
            ? { ...current, saved: willSave }
            : current
        ));
        setFeedMessage("");
      } catch (error) {
        console.error("Could not update saved story:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not update your saved stories."
        );
      }
      return;
    }

    setStories(
      (current) =>
        current.map(
          (story) =>
            story.id === id
              ? {
                  ...story,
                  saved:
                    !story.saved,
                }
              : story
        )
    );

    updateStoredStory(
      id,
      (story) => ({
        ...story,

        saved:
          !story.saved,
      })
    );

    setSelectedStory(
      (current) => {
        if (
          !current ||
          current.id !== id
        ) {
          return current;
        }

        return {
          ...current,

          saved:
            !current.saved,
        };
      }
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteStory = async (id) => {
    const story =
      stories.find(
        (item) =>
          item.id === id
      );

    if (
      !story ||
      !story.isMine
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this story?"
      );

    if (!confirmed) {
      return;
    }

    if (story.isRemote) {
      try {
        await apiRequest(`/api/stories/${id}`, {
          method: "DELETE",
        });
        setStories((current) =>
          current.filter((item) => item.id !== id)
        );
        setSelectedStory(null);
        setStoryComments([]);
        setFeedMessage("");
        window.dispatchEvent(new Event("tripStoryUpdated"));
      } catch (error) {
        console.error("Could not delete shared story:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not delete this story."
        );
      }
      return;
    }

    try {
      /*
        This app is configured so the logged-in user has only ONE
        published story. Clear the complete user-story collection
        when that story is deleted.

        This also removes any old/test stories that may have been
        left in localStorage and were previously appearing again
        as a second "You" story after deletion.
      */
      localStorage.removeItem("tripStories");

      setStories(
        (current) =>
          current.filter(
            (item) => !item.isMine
          )
      );

      setSelectedStory(null);

      setStoryComments([]);

      window.dispatchEvent(
        new Event(
          "tripStoryUpdated"
        )
      );
    } catch (error) {
      console.error(
        "Could not delete:",
        error
      );
    }
  };

  /* =======================================================
     OPEN STORY
  ======================================================= */

  const openStory = useCallback(async (
    story
  ) => {
    setSelectedStory(story);
    setCurrentPhoto(0);
    setStoryComments([]);
    setCommentText("");
    document.body.style.overflow = "hidden";

    if (story.isRemote) {
      try {
        const comments = await apiRequest(
          `/api/comments/story/${story.id}`
        );
        if (!Array.isArray(comments)) {
          throw new Error("The server returned an invalid comment list.");
        }
        const mappedComments = comments.map((comment) => ({
          ...comment,
          createdAt: Number(comment.date) || undefined,
        }));
        setStoryComments(mappedComments);
        setSelectedStory((current) => (
          current?.id === story.id
            ? { ...current, comments: mappedComments.length }
            : current
        ));
      } catch (error) {
        console.error("Could not load story comments:", error);
        setFeedMessage(
          error instanceof Error
            ? error.message
            : "Could not load comments for this story."
        );
      }
      return;
    }

    const comments = getCommentsForStory(story.id);
    setSelectedStory({ ...story, comments: comments.length });
    setStoryComments(
      comments
    );
  }, []);

  /* =======================================================
     OPEN STORY SENT FROM HOME
  ======================================================= */

  useEffect(() => {
    const storyFromHome =
      location.state?.selectedStory;

    if (!storyFromHome) {
      return;
    }

    if (
      handledHomeStory.current ===
      storyFromHome.id
    ) {
      return;
    }

    handledHomeStory.current =
      storyFromHome.id;

    const matchingStory =
      stories.find(
        (story) =>
          story.id ===
          `home-${storyFromHome.id}`
      );

    openStory(
      matchingStory || {
        ...storyFromHome,

        id: `home-${storyFromHome.id}`,

        author:
          getRandomDemoName(
            `home-${storyFromHome.id}`
          ),

        authorEmail: `${getRandomDemoName(
          `home-${storyFromHome.id}`
        )
          .toLowerCase()
          .replace(/\s+/g, ".")}@tripstories.demo`,

        avatar:
          getRandomDemoName(
            `home-${storyFromHome.id}`
          ).charAt(0).toUpperCase(),

        date:
          storyFromHome.date ||
          "Recently",

        text:
          storyFromHome.text ||
          storyFromHome.description ||
          "A journey worth remembering.",

        photos:
          Array.isArray(
            storyFromHome.photos
          ) &&
          storyFromHome.photos.length
            ? storyFromHome.photos
            : [
                storyFromHome.image,
              ],

        likes:
          Number(
            storyFromHome.likes
          ) || 0,

        comments:
          Number(
            storyFromHome.comments
          ) || 0,

        saved:
          Boolean(
            storyFromHome.saved
          ),

        isMine: false,
      }
    );
  }, [location.state, stories, openStory]);

  /* =======================================================
     CLOSE STORY
  ======================================================= */

  const closeStory = () => {
    setSelectedStory(null);

    setCurrentPhoto(0);

    setStoryComments([]);

    setCommentText("");

    document.body.style.overflow =
      "";
  };

  /* =======================================================
     NEXT PHOTO
  ======================================================= */

  const nextPhoto = () => {
    if (
      !selectedStory ||
      selectedStory.photos.length <=
        1
    ) {
      return;
    }

    setCurrentPhoto(
      (current) =>
        (current + 1) %
        selectedStory
          .photos.length
    );
  };

  /* =======================================================
     PREVIOUS PHOTO
  ======================================================= */

  const previousPhoto = () => {
    if (
      !selectedStory ||
      selectedStory.photos.length <=
        1
    ) {
      return;
    }

    setCurrentPhoto(
      (current) =>
        current === 0
          ? selectedStory
              .photos.length -
            1
          : current - 1
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="inspired-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="inspired-hero">

        <div className="hero-copy">

          <span className="inspired-eyebrow">
            STORIES FROM THE ROAD
          </span>

          <h1>
            Get inspired.
            <br />
            <em>Go somewhere.</em>
          </h1>

          <p>
            Real journeys, little
            discoveries and stories
            from people who decided
            to go.
          </p>

          <div className="hero-mini-stats">

            <span>
              <strong>
                {stories.length}
              </strong>
              Stories
            </span>

            <span className="hero-dot">
              •
            </span>

            <span>
              <strong>
                {
                  new Set(
                    stories.map(
                      (story) =>
                        story.location
                    )
                  ).size
                }
              </strong>
              Destinations
            </span>

          </div>

        </div>

        <div className="inspired-circle">

          <div className="circle-inner">
            <span>READ</span>
            <span>WANDER</span>
            <span>REPEAT</span>
          </div>

        </div>

      </section>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="inspired-toolbar">

        <div className="inspired-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search stories, people or places..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <div className="story-filters">

          {filters.map(
            (filter) => (
              <button
                type="button"
                key={filter}
                className={
                  activeFilter ===
                  filter
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveFilter(
                    filter
                  )
                }
              >
                {filter}
              </button>
            )
          )}

        </div>

      </section>

      {/* =================================================
          STORIES
      ================================================= */}

      <section className="stories-section">

        {feedMessage && (
          <p className="feed-status-message" role="alert">
            {feedMessage}
          </p>
        )}

        <div className="stories-heading">

          <div>

            <span>
              {
                visibleStories.length
              }{" "}
              STORIES
            </span>

            <h2>
              Journeys worth{" "}
              <em>
                remembering.
              </em>
            </h2>

          </div>

          <div className="heading-decoration">
            <span />
            <span />
            <span />
          </div>

        </div>

        {visibleStories.length ===
        0 ? (
          <div className="stories-empty">

            <span>✦</span>

            <h3>
              Nothing here yet.
            </h3>

            <p>
              Try another search or
              explore all stories.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveFilter(
                  "Latest"
                );
              }}
            >
              Show all stories
            </button>

          </div>
        ) : (
          <div className="stories-grid">

            {visibleStories.map(
              (story) => {

                const liked =
                  likedStories.includes(
                    story.id
                  );

                const following =
                  followedUsers.includes(
                    story.authorEmail ||
                      story.author
                  );

                return (
                  <article
                    className="story-card"
                    key={story.id}
                  >

                    {/* =================================
                        IMAGE
                    ================================= */}

                    <div
                      className="story-image"
                      onClick={() =>
                        openStory(
                          story
                        )
                      }
                    >

                      <img
                        src={
                          story.image
                        }
                        alt={
                          story.title
                        }
                      />

                      <div className="story-image-gradient" />

                      {story.photos.length >
                        1 && (
                        <span className="story-photo-count">
                          {
                            story.photos
                              .length
                          }{" "}
                          images
                        </span>
                      )}

                      <span className="story-location">
                        {
                          story.location
                        }
                      </span>

                      <span className="story-open">
                        Read story{" "}
                        <b>→</b>
                      </span>

                    </div>

                    {/* =================================
                        CONTENT
                    ================================= */}

                    <div className="story-content">

                      <div className="story-author">

                        <div className="author-avatar">
                          {
                            story.avatar
                          }
                        </div>

                        <div className="author-info">

                          <strong>
                            {
                              story.author
                            }
                          </strong>

                          <span>
                            {story.date}
                          </span>

                        </div>

                        {!story.isMine && (
                          <button
                            type="button"
                            className={
                              following
                                ? "follow-button following"
                                : "follow-button"
                            }
                            onClick={() =>
                              toggleFollow(
                                story
                              )
                            }
                          >
                            {following
                              ? "Following"
                              : "Follow"}
                          </button>
                        )}

                      </div>

                      <h3>
                        {story.title}
                      </h3>

                      <p>
                        {story.text}
                      </p>

                      {/* =================================
                          ACTIONS
                      ================================= */}

                      <div className="story-actions">

                        {/* LIKE */}

                        <button
                          type="button"
                          className={
                            liked
                              ? "liked"
                              : ""
                          }
                          onClick={() =>
                            toggleLike(
                              story.id
                            )
                          }
                        >

                          <span className="action-icon">
                            {liked
                              ? "♥"
                              : "♡"}
                          </span>

                          <span>
                            {
                              story.likes
                            }
                          </span>

                        </button>

                        {/* COMMENT */}

                        <button
                          type="button"
                          onClick={() =>
                            openStory(
                              story
                            )
                          }
                        >

                          <span className="action-icon">
                            ♡
                          </span>

                          <span>
                            {
                              story.comments
                            }
                          </span>

                        </button>

                        {/* SAVE */}

                        <button
                          type="button"
                          className={
                            story.saved
                              ? "saved"
                              : ""
                          }
                          onClick={() =>
                            toggleSave(
                              story.id
                            )
                          }
                        >

                          <span className="action-icon">
                            {story.saved
                              ? "★"
                              : "☆"}
                          </span>

                          <span className="save-text">
                            {story.saved
                              ? "Saved"
                              : "Save"}
                          </span>

                        </button>

                        {/* DELETE ONLY FOR USER'S OWN STORY */}

                        {story.isMine && (
                          <button
                            type="button"
                            className="story-delete-small"
                            onClick={() =>
                              deleteStory(
                                story.id
                              )
                            }
                          >
                            Delete
                          </button>
                        )}

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* =================================================
          QUOTE
      ================================================= */}

      <section className="inspired-quote">

        <div className="quote-line" />

        <span>
          EVERY JOURNEY STARTS
          SOMEWHERE
        </span>

        <blockquote>
          “Sometimes the best stories
          begin with a ticket and no
          plan.”
        </blockquote>

        <div className="quote-line" />

      </section>

      {/* =================================================
          SHARE
      ================================================= */}

      <section className="inspired-share">

        <div className="share-copy">

          <span>
            YOUR TURN
          </span>

          <h2>
            Where did your
            <br />
            story <em>begin?</em>
          </h2>

          <p>
            Turn your journey into a
            story someone else can be
            inspired by.
          </p>

        </div>

        <Link to="/share-story">

          <span>
            Share your story
          </span>

          <b>↗</b>

        </Link>

      </section>

      {/* =================================================
          STORY MODAL
      ================================================= */}

      {selectedStory && (
        <div
          className="story-modal-backdrop"
          onClick={closeStory}
        >

          <div
            className="story-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="story-modal-close"
              onClick={closeStory}
            >
              ×
            </button>

            {/* =========================================
                MODAL HEADER
            ========================================= */}

            <div className="modal-top">

              <div className="modal-author">

                <div className="author-avatar">
                  {
                    selectedStory.avatar
                  }
                </div>

                <div>

                  <strong>
                    {
                      selectedStory.author
                    }
                  </strong>

                  <span>
                    {
                      selectedStory.location
                    }
                  </span>

                </div>

              </div>

              {!selectedStory.isMine && (
                <button
                  type="button"
                  className={
                    followedUsers.includes(
                      selectedStory.authorEmail ||
                        selectedStory.author
                    )
                      ? "modal-follow following"
                      : "modal-follow"
                  }
                  onClick={() =>
                    toggleFollow(
                      selectedStory
                    )
                  }
                >
                  {followedUsers.includes(
                    selectedStory.authorEmail ||
                      selectedStory.author
                  )
                    ? "Following"
                    : "Follow"}
                </button>
              )}

            </div>

            {/* =========================================
                MAIN PHOTO
            ========================================= */}

            <div className="story-modal-main-photo">

              <img
                src={
                  selectedStory
                    .photos[
                      currentPhoto
                    ] ||
                  selectedStory.image
                }
                alt={
                  selectedStory.title
                }
              />

              {selectedStory.photos.length >
                1 && (
                <>

                  <button
                    type="button"
                    className="gallery-arrow gallery-prev"
                    onClick={
                      previousPhoto
                    }
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="gallery-arrow gallery-next"
                    onClick={
                      nextPhoto
                    }
                  >
                    ›
                  </button>

                  <div className="gallery-counter">

                    {currentPhoto + 1}
                    {" / "}
                    {
                      selectedStory
                        .photos
                        .length
                    }

                  </div>

                </>
              )}

            </div>

            {/* =========================================
                THUMBNAILS
            ========================================= */}

            {selectedStory.photos.length >
              1 && (
              <div className="story-thumbnails">

                {selectedStory.photos.map(
                  (
                    photo,
                    index
                  ) => (
                    <button
                      type="button"
                      key={`${photo}-${index}`}
                      className={
                        currentPhoto ===
                        index
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPhoto(
                          index
                        )
                      }
                    >

                      <img
                        src={photo}
                        alt={`Photo ${
                          index + 1
                        }`}
                      />

                    </button>
                  )
                )}

              </div>
            )}

            {/* =========================================
                MODAL CONTENT
            ========================================= */}

            <div className="story-modal-content">

              <div className="modal-meta">

                <span>
                  {
                    selectedStory.date
                  }
                </span>

                <span>
                  {
                    selectedStory
                      .photos
                      .length
                  }{" "}
                  images
                </span>

              </div>

              <h2>
                {
                  selectedStory.title
                }
              </h2>

              <p className="modal-story-text">
                {
                  selectedStory.text
                }
              </p>

              {/* =====================================
                  MODAL ACTIONS
              ===================================== */}

              <div className="modal-actions">

                <button
                  type="button"
                  className={
                    likedStories.includes(
                      selectedStory.id
                    )
                      ? "active-like"
                      : ""
                  }
                  onClick={() =>
                    toggleLike(
                      selectedStory.id
                    )
                  }
                >

                  <span>
                    {likedStories.includes(
                      selectedStory.id
                    )
                      ? "♥"
                      : "♡"}
                  </span>

                  Like{" "}
                  {
                    selectedStory.likes
                  }

                </button>

                <button
                  type="button"
                  onClick={() => {
                    const commentBox =
                      document.getElementById(
                        "story-comment-box"
                      );

                    if (commentBox) {
                      commentBox.focus();
                    }
                  }}
                >

                  <span>
                    ♡
                  </span>

                  Comment{" "}
                  {storyComments.length}

                </button>

                <button
                  type="button"
                  className={
                    selectedStory.saved
                      ? "active-save"
                      : ""
                  }
                  onClick={() =>
                    toggleSave(
                      selectedStory.id
                    )
                  }
                >

                  <span>
                    {
                      selectedStory.saved
                        ? "★"
                        : "☆"
                    }
                  </span>

                  {
                    selectedStory.saved
                      ? "Saved"
                      : "Save"
                  }

                </button>

                {!selectedStory.isMine && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleFollow(
                        selectedStory
                      )
                    }
                  >

                    <span>
                      ＋
                    </span>

                    {followedUsers.includes(
                      selectedStory.authorEmail ||
                        selectedStory.author
                    )
                      ? "Following"
                      : "Follow"}

                  </button>
                )}

              </div>

              {/* =====================================
                  COMMENTS
              ===================================== */}

              <div className="comments-area">

                <div className="comments-heading">

                  <div>

                    <span>
                      JOIN THE STORY
                    </span>

                    <h3>
                      Leave a comment
                    </h3>

                  </div>

                  <span className="comment-number">
                    {storyComments.length}
                  </span>

                </div>

                <div className="comment-input">

                  <input
                    id="story-comment-box"
                    type="text"
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(event) =>
                      setCommentText(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();
                        postComment();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={
                      postComment
                    }
                    disabled={
                      !commentText.trim()
                    }
                  >
                    Post
                  </button>

                </div>

                {/* POSTED COMMENTS */}

                {storyComments.length >
                  0 && (
                  <div className="posted-comments">

                    {storyComments.map(
                      (comment) => (
                        <div
                          className="posted-comment"
                          key={
                            comment.id
                          }
                        >

                          <div className="author-avatar">
                            {
                              comment.avatar
                            }
                          </div>

                          <div className="posted-comment-content">

                            <div className="posted-comment-header">

                              <strong>
                                {
                                  comment.author
                                }
                              </strong>

                              <span>
                                {formatCommentDate(
                                  comment
                                )}
                              </span>

                            </div>

                            <p>
                              {
                                comment.text
                              }
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* DELETE FROM MODAL */}

              {selectedStory.isMine && (
                <button
                  type="button"
                  className="delete-story"
                  onClick={() =>
                    deleteStory(
                      selectedStory.id
                    )
                  }
                >
                  Delete story
                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default InspiredStories;