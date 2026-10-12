import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  clearAuthSession,
  getSessionUser,
  hasValidAccessToken,
  apiRequest,
} from "../api";
import { mapApiStory } from "../utils/mapApiStory";

import "../styles/profile.css";


/* =========================================================
   GET USER
========================================================= */

function getStoredUser() {
  const sessionUser = getSessionUser();

  if (sessionUser) {
    return sessionUser;
  }

  try {
    return JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
}

function normalizeProfileUser(savedUser) {
  if (!savedUser) {
    return {
      name: "Traveler",
      email: "",
    };
  }

  return {
    ...savedUser,
    name: savedUser.name || savedUser.username || "Traveler",
    email: savedUser.email || "",
  };
}


/* =========================================================
   GET STORIES
========================================================= */

function getStories() {
  try {
    const stories = JSON.parse(
      localStorage.getItem("tripStories") || "[]"
    );

    return Array.isArray(stories)
      ? stories
      : [];
  } catch {
    return [];
  }
}


/* =========================================================
   GET SOCIAL DATA
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


/* =========================================================
   PROFILE
========================================================= */

function Profile() {

  const navigate = useNavigate();


  const [user, setUser] = useState(() =>
    normalizeProfileUser(getStoredUser())
  );


  const [editing, setEditing] =
    useState(false);


  const [name, setName] = useState(() =>
    normalizeProfileUser(getStoredUser()).name
  );


  const [stories, setStories] = useState(getStories);

  const [remoteStories, setRemoteStories] =
    useState([]);

  const [remoteFeedStories, setRemoteFeedStories] =
    useState([]);


  const [social, setSocial] = useState(getSocialData);

  const [profileMessage, setProfileMessage] =
    useState("");


  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile = () => {

    const normalizedUser =
      normalizeProfileUser(getStoredUser());

    setUser(normalizedUser);
    setName(normalizedUser.name);


    setStories(
      getStories()
    );


    setSocial(
      getSocialData()
    );
  };


  useEffect(() => {

    const refresh = () => {
      loadProfile();
    };


    window.addEventListener(
      "storage",
      refresh
    );

    window.addEventListener(
      "focus",
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
        "storage",
        refresh
      );

      window.removeEventListener(
        "focus",
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

  }, []);

  useEffect(() => {
    let active = true;

    const loadRemoteProfileData = async () => {
      const currentUser = getStoredUser();
      if (!hasValidAccessToken() || !currentUser?.email) {
        setRemoteStories([]);
        setRemoteFeedStories([]);
        return;
      }

      try {
        const encodedEmail = encodeURIComponent(currentUser.email);
        const [
          apiStories,
          apiFeedStories,
          apiFollowers,
          apiFollowing,
          apiLikes,
        ] = await Promise.all([
          apiRequest(`/api/stories/user/${encodedEmail}`),
          apiRequest("/api/stories"),
          apiRequest(`/api/social/followers/${encodedEmail}`),
          apiRequest(`/api/social/following/${encodedEmail}`),
          apiRequest("/api/social/likes"),
        ]);

        if (!active) {
          return;
        }

        setRemoteStories(
          (Array.isArray(apiStories) ? apiStories : [])
            .map((story) => mapApiStory(story, currentUser.email))
        );
        setRemoteFeedStories(
          (Array.isArray(apiFeedStories) ? apiFeedStories : [])
            .map((story) => mapApiStory(story, currentUser.email))
        );
        setSocial((current) => {
          const local = getSocialData();
          const profile = local[currentUser.email] || current[currentUser.email] || {};
          return {
            ...local,
            [currentUser.email]: {
              ...profile,
              followers: [
                ...new Set([
                  ...(Array.isArray(profile.followers) ? profile.followers : []),
                  ...(Array.isArray(apiFollowers)
                    ? apiFollowers.map((follow) => follow.followerEmail)
                    : []),
                ]),
              ],
              following: [
                ...new Set([
                  ...(Array.isArray(profile.following) ? profile.following : []),
                  ...(Array.isArray(apiFollowing)
                    ? apiFollowing.map((follow) => follow.followingEmail)
                    : []),
                ]),
              ],
              likedStories: [
                ...new Set([
                  ...(Array.isArray(profile.likedStories)
                    ? profile.likedStories
                    : []),
                  ...(Array.isArray(apiLikes) ? apiLikes : []),
                ]),
              ],
            },
          };
        });
        setProfileMessage("");
      } catch (error) {
        console.error("Could not load profile data:", error);
        if (active) {
          setProfileMessage(
            error instanceof Error
              ? error.message
              : "Could not load your online profile data."
          );
        }
      }
    };

    loadRemoteProfileData();
    window.addEventListener("tripStoryUpdated", loadRemoteProfileData);
    window.addEventListener("focus", loadRemoteProfileData);

    return () => {
      active = false;
      window.removeEventListener("tripStoryUpdated", loadRemoteProfileData);
      window.removeEventListener("focus", loadRemoteProfileData);
    };
  }, []);


  /* =======================================================
     PROFILE KEY
  ======================================================= */

  const profileKey =
    user.email || user.name;


  const profileSocial =
    social[profileKey] || {};


  const followers =
    Array.isArray(
      profileSocial.followers
    )
      ? profileSocial.followers
      : [];


  const following =
    Array.isArray(
      profileSocial.following
    )
      ? profileSocial.following
      : [];


  const likedStoryIds =
    Array.isArray(
      profileSocial.likedStories
    )
      ? profileSocial.likedStories
      : [];


  /* =======================================================
     MY STORIES
     
     FIX:
     Stories saved in tripStories are the stories
     created by the logged-in user.
     
     We use the stored stories directly so the
     profile count correctly becomes 1, 2, 3...
  ======================================================= */

  const myStories = useMemo(() => {

    return [
      ...remoteStories,
      ...(Array.isArray(stories) ? stories : []),
    ];

  }, [remoteStories, stories]);


  /* =======================================================
     TOTAL LIKES
  ======================================================= */

  const totalLikes =
    myStories.reduce(
      (total, story) =>
        total +
        (
          Number(
            story.likes
          ) || 0
        ),
      0
    );


  /* =======================================================
     LIKED STORIES
  ======================================================= */

  const likedStories = [
    ...remoteFeedStories.filter((story) =>
      likedStoryIds.includes(story.id)
    ),
    ...stories.filter((story) =>
      likedStoryIds.includes(story.id)
    ),
  ];


  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const saveProfile = async () => {

    const cleanName =
      name.trim() || "Traveler";

    setProfileMessage("");

    if (hasValidAccessToken() && user.id) {
      try {
        const responseUser = await apiRequest(
          `/api/users/${user.id}`,
          {
            method: "PUT",
            body: JSON.stringify({ username: cleanName }),
          }
        );
        const updatedUser = {
          ...getSessionUser(),
          ...responseUser,
          name: responseUser.username || cleanName,
        };

        sessionStorage.setItem(
          "tripStoriesSessionUser",
          JSON.stringify(updatedUser)
        );
        setUser(updatedUser);
      } catch (error) {
        setProfileMessage(
          error instanceof Error
            ? error.message
            : "Could not save profile changes."
        );
        return;
      }
    } else {
      const updatedUser = {
        ...user,
        name: cleanName,
      };

      setUser(updatedUser);
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );
    }


    setEditing(false);


    window.dispatchEvent(
      new Event(
        "tripstories-auth"
      )
    );

  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    clearAuthSession();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  /* =======================================================
     AVATAR
  ======================================================= */

  const avatarLetter =
    user.name
      ? user.name
          .charAt(0)
          .toUpperCase()
      : "T";


  /* =======================================================
     STORY PHOTO
  ======================================================= */

  const getStoryPhoto =
    (story) => {

      if (
        Array.isArray(
          story.photos
        ) &&
        story.photos.length > 0
      ) {

        return story.photos[0];

      }


      return story.image || "";

    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <main className="profile-page">

      {/* ================================
          HERO
      ================================= */}

      <section className="profile-hero">

        <div className="profile-intro">

          <span className="profile-eyebrow">
            YOUR TRAVEL SPACE
          </span>


          <h1>

            Welcome back,

            <br />

            <em>
              {user.name}.
            </em>

          </h1>


          <p>
            Keep your journeys, memories
            and travel stories close.
          </p>

        </div>


        <div className="profile-avatar-large">

          <span>
            {avatarLetter}
          </span>

        </div>

      </section>


      {/* ================================
          STATS
      ================================= */}

      <section className="profile-stats">

        <div className="profile-stat">

          <strong>
            {myStories.length}
          </strong>

          <span>
            STORIES
          </span>

        </div>


        <div className="profile-stat">

          <strong>
            {followers.length}
          </strong>

          <span>
            FOLLOWERS
          </span>

        </div>


        <div className="profile-stat">

          <strong>
            {following.length}
          </strong>

          <span>
            FOLLOWING
          </span>

        </div>


        <div className="profile-stat">

          <strong>
            {totalLikes}
          </strong>

          <span>
            LIKES RECEIVED
          </span>

        </div>

      </section>


      {/* ================================
          CONTENT
      ================================= */}

      <section className="profile-content">

        {/* PERSONAL INFORMATION */}

        <div className="profile-card">

          <div className="profile-card-header">

            <div>

              <span>
                ACCOUNT
              </span>

              <h2>
                Personal information
              </h2>

            </div>


            {!editing && (

              <button
                type="button"
                className="profile-edit-button"
                onClick={() =>
                  setEditing(true)
                }
              >
                Edit profile
              </button>

            )}

          </div>


          <div className="profile-field">

            <label>
              Name
            </label>


            {editing ? (

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Enter your name"
              />

            ) : (

              <div className="profile-value">
                {user.name}
              </div>

            )}

          </div>


          <div className="profile-field">

            <label>
              Email
            </label>


            <div className="profile-value">

              {user.email ||
                "No email available"}

            </div>

          </div>

          <div className="profile-edit-actions">
            <Link
              to="/export-data"
              className="profile-edit-button"
            >
              Export local data
            </Link>
          </div>

          {profileMessage && (
            <p className="profile-save-message" role="alert">
              {profileMessage}
            </p>
          )}

          {editing && (

            <div className="profile-edit-actions">

              <button
                type="button"
                className="profile-save-button"
                onClick={saveProfile}
              >
                Save changes
              </button>


              <button
                type="button"
                className="profile-cancel-button"
                onClick={() => {

                  setName(
                    user.name
                  );

                  setEditing(false);

                }}
              >
                Cancel
              </button>

            </div>

          )}

        </div>


        {/* MY STORIES */}

        <div className="profile-card">

          <div className="profile-card-header">

            <div>

              <span>
                YOUR JOURNEYS
              </span>

              <h2>
                Your stories
              </h2>

            </div>

            <span className="profile-star">
              ✦
            </span>

          </div>


          {myStories.length === 0 ? (

            <div className="profile-empty">

              <p>
                You haven't shared a story yet.
              </p>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/share-story"
                  )
                }
              >
                Share your first story →
              </button>

            </div>

          ) : (

            <div className="profile-story-list">

              {myStories.map(
                (story) => {

                  const photo =
                    getStoryPhoto(
                      story
                    );


                  return (

                    <div
                      className="profile-story-item"
                      key={
                        story.id ||
                        story._id ||
                        story.title
                      }
                    >

                      {photo && (

                        <img
                          src={photo}
                          alt={
                            story.title ||
                            "Travel story"
                          }
                        />

                      )}


                      <div>

                        <strong>
                          {story.title ||
                            "Untitled story"}
                        </strong>


                        <span>
                          {story.location ||
                            story.destination ||
                            "Travel story"}
                        </span>


                        <small>
                          ♥{" "}
                          {
                            Number(
                              story.likes
                            ) || 0
                          } likes
                        </small>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </div>


        {/* LIKED STORIES */}

        <div className="profile-card">

          <div className="profile-card-header">

            <div>

              <span>
                YOUR ACTIVITY
              </span>

              <h2>
                Stories you liked
              </h2>

            </div>

            <span className="profile-star">
              ♥
            </span>

          </div>


          {likedStories.length === 0 ? (

            <div className="profile-empty">

              <p>
                You haven't liked any stories yet.
              </p>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/inspired-stories"
                  )
                }
              >
                Discover stories →
              </button>

            </div>

          ) : (

            <div className="profile-story-list">

              {likedStories.map(
                (story) => {

                  const photo =
                    getStoryPhoto(
                      story
                    );


                  return (

                    <button
                      type="button"
                      className="profile-story-item profile-liked-story"
                      key={
                        story.id ||
                        story._id ||
                        story.title
                      }
                      onClick={() =>
                        navigate(
                          "/inspired-stories"
                        )
                      }
                    >

                      {photo && (

                        <img
                          src={photo}
                          alt={
                            story.title ||
                            "Travel story"
                          }
                        />

                      )}


                      <div>

                        <strong>
                          {story.title ||
                            "Untitled story"}
                        </strong>


                        <span>
                          By{" "}
                          {
                            story.author?.name ||
                            story.author ||
                            "Traveler"
                          }
                        </span>


                        <small>
                          ♥ You liked this story
                        </small>

                      </div>

                    </button>

                  );

                }
              )}

            </div>

          )}

        </div>


        {/* EXPLORE */}

        <div className="profile-card profile-travel-card">

          <div className="profile-card-header">

            <div>

              <span>
                YOUR JOURNEY
              </span>

              <h2>
                Keep exploring.
              </h2>

            </div>

            <span className="profile-star">
              ✦
            </span>

          </div>


          <p className="profile-card-description">

            Discover new destinations, read
            inspiring journeys and share the
            places that mean something to you.

          </p>


          <div className="profile-actions">

            <button
              type="button"
              onClick={() =>
                navigate("/explore")
              }
            >
              Explore places
              <span>→</span>
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/inspired-stories"
                )
              }
            >
              Read stories
              <span>→</span>
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/share-story"
                )
              }
            >
              Share your story
              <span>→</span>
            </button>

          </div>

        </div>


        {/* LOGOUT */}

        <div className="profile-logout-section">

          <div>

            <span>
              ACCOUNT
            </span>

            <h3>
              Ready to leave?
            </h3>

            <p>
              You can always come back
              and continue your journey.
            </p>

          </div>


          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </section>

    </main>
  );
}


export default Profile;