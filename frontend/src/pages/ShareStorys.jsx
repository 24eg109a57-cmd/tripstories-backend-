import { useState } from "react";
import {
  apiRequest,
  getSessionUser,
  hasValidAccessToken,
} from "../api";
import { createStoryFormData } from "../utils/storyUpload";

import "../styles/shareStory.css";

function ShareStorys() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [story, setStory] = useState("");
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState("");

  // =====================================================
  // COMPRESS IMAGE
  // =====================================================

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          // Maximum width / height
          const MAX_SIZE = 600;

          let width = img.width;
          let height = img.height;

          // Resize while keeping original aspect ratio
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round(
                height * (MAX_SIZE / width)
              );

              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round(
                width * (MAX_SIZE / height)
              );

              height = MAX_SIZE;
            }
          }

          const canvas =
            document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext("2d");

          context.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          /*
           * Start with compressed JPEG.
           */
          let quality = 0.55;

          let compressedImage =
            canvas.toDataURL(
              "image/jpeg",
              quality
            );

          /*
           * Keep reducing quality if the
           * image is still too large.
           *
           * Base64 length is used here because
           * localStorage stores the Base64 string.
           */
          while (
            compressedImage.length > 110000 &&
            quality > 0.15
          ) {
            quality -= 0.05;

            compressedImage =
              canvas.toDataURL(
                "image/jpeg",
                quality
              );
          }

          resolve(compressedImage);
        };

        img.onerror = () => {
          reject(
            new Error(
              "Could not load image."
            )
          );
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Could not read image."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // =====================================================
  // PHOTO UPLOAD
  // =====================================================

  const handlePhotos = async (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    // Maximum 6 photos total
    const remainingSlots =
      6 - photos.length;

    if (remainingSlots <= 0) {
      setMessage(
        "You can share up to 6 photos."
      );

      event.target.value = "";

      return;
    }

    // Only take the number of photos
    // that can still fit
    const selectedFiles =
      files.slice(
        0,
        remainingSlots
      );

    try {
      setMessage(
        "Preparing your photos..."
      );

      const compressedImages =
        await Promise.all(
          selectedFiles.map(
            (file) =>
              compressImage(file)
          )
        );

      /*
       * IMPORTANT:
       *
       * Add new photos to existing photos.
       * Do NOT replace the old photos.
       */
      setPhotos(
        (currentPhotos) => [
          ...currentPhotos,
          ...compressedImages,
        ]
      );

      setMessage("");

    } catch (error) {
      console.error(
        "Photo compression error:",
        error
      );

      setMessage(
        "Could not process one or more photos."
      );
    }

    /*
     * Reset input so the same photo
     * can be selected again.
     */
    event.target.value = "";
  };

  // =====================================================
  // REMOVE PHOTO
  // =====================================================

  const removePhoto = (index) => {
    setPhotos(
      (current) =>
        current.filter(
          (_, i) => i !== index
        )
    );
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // TITLE VALIDATION
    if (!title.trim()) {
      setMessage(
        "Please enter a title."
      );

      return;
    }

    // STORY VALIDATION
    if (!story.trim()) {
      setMessage(
        "Please write your story."
      );

      return;
    }

    try {
      // =================================================
      // CURRENT USER
      // =================================================

      const currentUser =
        getSessionUser() ||
        JSON.parse(
          localStorage.getItem("user") || "null"
        );

      // =================================================
      // NEW STORY
      // =================================================

      const newStory = {
        id:
          Date.now().toString(),

        title:
          title.trim(),

        location:
          location.trim(),

        story:
          story.trim(),

        /*
         * COMPRESSED PHOTOS
         *
         * These are the small Base64 images
         * created by compressImage().
         */
        photos:
          photos,

        likes:
          0,

        author: {
          name:
            currentUser?.name ||
            currentUser?.username ||
            "Traveler",

          email:
            currentUser?.email ||
            "",
        },

        createdAt:
          new Date().toISOString(),
      };

      if (hasValidAccessToken()) {
        setMessage("Uploading your story and photos...");

        const formData = createStoryFormData(
          {
            title: newStory.title,
            destination: newStory.location,
            text: newStory.story,
          },
          photos
        );
        await apiRequest("/api/stories", {
          method: "POST",
          body: formData,
        });

        window.dispatchEvent(new Event("tripStoryUpdated"));
        setTitle("");
        setLocation("");
        setStory("");
        setPhotos([]);
        setMessage("Your story has been shared successfully!");
        return;
      }

      // =================================================
      // GET EXISTING STORIES
      // =================================================

      const existingStories =
        JSON.parse(
          localStorage.getItem(
            "tripStories"
          ) || "[]"
        );

      const validExistingStories =
        Array.isArray(
          existingStories
        )
          ? existingStories
          : [];

      // =================================================
      // ADD NEW STORY
      // =================================================

      const updatedStories = [
        newStory,
        ...validExistingStories,
      ];

      // =================================================
      // SAVE TO LOCAL STORAGE
      // =================================================

      try {
        localStorage.setItem(
          "tripStories",
          JSON.stringify(
            updatedStories
          )
        );

      } catch (storageError) {
        console.error(
          "LocalStorage error:",
          storageError
        );

        setMessage(
          "The photos are still too large to save. Please use smaller images or fewer photos."
        );

        return;
      }

      // =================================================
      // UPDATE INSPIRED STORIES
      // =================================================

      window.dispatchEvent(
        new Event(
          "tripStoryUpdated"
        )
      );

      // =================================================
      // CLEAR FORM
      // =================================================

      setTitle("");

      setLocation("");

      setStory("");

      setPhotos([]);

      // =================================================
      // SUCCESS
      // =================================================

      setMessage(
        "Your story has been shared successfully!"
      );

    } catch (error) {
      console.error(
        "Share story error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your story."
      );
    }
  };

  return (
    <main className="share-story-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="share-story-hero">

        <div className="share-story-hero-content">

          <span>
            SHARE THE JOURNEY
          </span>

          <h1>
            Every journey
            <br />
            has a <em>story.</em>
          </h1>

          <p>
            Share the places, people and moments
            that made your journey unforgettable.
          </p>

        </div>

        <div className="share-story-circle">

          <span>
            YOUR STORY
          </span>

          <span>
            ✦
          </span>

          <span>
            YOUR JOURNEY
          </span>

        </div>

      </section>

      {/* =================================================
          FORM
      ================================================= */}

      <section className="share-story-form-section">

        <div className="share-story-intro">

          <span>
            TELL US ABOUT IT
          </span>

          <h2>
            Write about
            <br />
            the moments
            <br />
            <em>
              worth remembering.
            </em>
          </h2>

        </div>

        <form
          className="share-story-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="share-form-group">

            <label>
              STORY TITLE
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Give your journey a name"
            />

          </div>

          {/* =================================================
              LOCATION
          ================================================= */}

          <div className="share-form-group">

            <label>
              DESTINATION
            </label>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              placeholder="Where did you go?"
            />

          </div>

          {/* =================================================
              STORY
          ================================================= */}

          <div className="share-form-group">

            <label>
              YOUR STORY
            </label>

            <textarea
              value={story}
              onChange={(event) =>
                setStory(
                  event.target.value
                )
              }
              placeholder="Write about the moments you want others to remember."
            />

          </div>

          {/* =================================================
              PHOTOS
          ================================================= */}

          <div className="share-form-group">

            <label>
              STORY PHOTOS
            </label>

            <label
              className={
                photos.length > 0
                  ? "story-image-upload has-image"
                  : "story-image-upload"
              }
            >

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotos}
              />

              {/* =========================================
                  EMPTY PHOTO AREA
              ========================================= */}

              {photos.length === 0 ? (

                <div className="upload-placeholder">

                  <div className="upload-plus">
                    +
                  </div>

                  <strong>
                    Add photos
                  </strong>

                  <p>
                    0/6 photos
                  </p>

                </div>

              ) : (

                /* =======================================
                   PHOTO GRID
                ======================================= */

                <div className="story-photo-grid">

                  {photos.map(
                    (photo, index) => (

                      <div
                        className="story-photo-item"
                        key={index}
                      >

                        <img
                          src={photo}
                          alt={`Story ${
                            index + 1
                          }`}
                        />

                        {/* REMOVE PHOTO */}

                        <button
                          type="button"
                          className="story-photo-remove"
                          onClick={(event) => {

                            event.preventDefault();

                            event.stopPropagation();

                            removePhoto(
                              index
                            );

                          }}
                        >
                          ×
                        </button>

                      </div>

                    )
                  )}

                  {/* =================================
                      ADD MORE
                  ================================= */}

                  {photos.length < 6 && (

                    <div className="story-photo-add-more">

                      <span>
                        +
                      </span>

                      <small>
                        {photos.length}/6
                      </small>

                    </div>

                  )}

                </div>

              )}

            </label>

            <small>
              You can share up to 6 photos from your journey.
            </small>

          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (

            <div
              className={
                message.includes(
                  "successfully"
                )
                  ? "share-message success"
                  : "share-message error"
              }
            >
              {message}
            </div>

          )}

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="share-submit-button"
          >

            <span>
              Share your story
            </span>

            <span>
              →
            </span>

          </button>

        </form>

      </section>

      {/* =================================================
          QUOTE
      ================================================= */}

      <section className="share-story-quote">

        <div className="share-quote-line" />

        <span>
          TRAVEL • REMEMBER • SHARE
        </span>

        <blockquote>
          "The best stories are the ones
          we get to tell again."
        </blockquote>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="share-story-footer">

        <div>

          <strong>
            ✦ TRIPSTORIES
          </strong>

          <p>
            Every journey has a story.
          </p>

        </div>

        <div className="share-footer-links">

          <a href="/">
            Home
          </a>

          <a href="/explore">
            Explore
          </a>

          <a href="/inspired-stories">
            Inspired Stories
          </a>

        </div>

      </footer>

    </main>
  );
}

export default ShareStorys;