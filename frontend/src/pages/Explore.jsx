import { useState } from "react";
import "../styles/explore.css";

function Explore() {
  const [search, setSearch] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);

  /*
  =========================================================
  DESTINATIONS
  =========================================================
  */

  const destinations = [
    {
      id: 1,
      name: "Paris",
      country: "France",
      description:
        "Romantic streets, beautiful cafés and unforgettable moments.",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
      author: "Maya",

      /*
      Multiple journey updates.
      Add more objects here when the user visits another place.
      */

      journeyUpdates: [
        {
          id: "paris-1",
          place: "Eiffel Tower, Paris",
          date: "Monday, 21 September 2026",
          time: "11:35 AM",
          image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=90",
          text:
            "Today I finally reached Paris. I walked around the Eiffel Tower, explored the beautiful streets nearby and stopped at a small café. The city feels even more beautiful than I imagined."
        },

        {
          id: "paris-2",
          place: "Seine River, Paris",
          date: "Tuesday, 22 September 2026",
          time: "5:20 PM",
          image:
            "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=1400&q=90",
          text:
            "This evening I walked beside the Seine River. The sunset, boats and lights across Paris made the whole evening feel magical."
        }
      ]
    },

    {
      id: 2,
      name: "Manali",
      country: "India",
      description:
        "Mountain views, peaceful mornings and unforgettable adventures.",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
      author: "Aarav",

      journeyUpdates: []
    },

    {
      id: 3,
      name: "Santorini",
      country: "Greece",
      description:
        "Blue skies, white villages and beautiful Mediterranean sunsets.",
      image:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85",
      author: "Sofia",

      journeyUpdates: []
    },

    {
      id: 4,
      name: "Bali",
      country: "Indonesia",
      description:
        "Tropical beaches, peaceful temples and unforgettable experiences.",
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
      author: "Lina",

      journeyUpdates: []
    },

    {
      id: 5,
      name: "Dubai",
      country: "UAE",
      description:
        "Modern architecture, desert adventures and city experiences.",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
      author: "Zayn",

      journeyUpdates: []
    },

    {
      id: 6,
      name: "Kyoto",
      country: "Japan",
      description:
        "Ancient temples, peaceful gardens and traditional Japanese culture.",
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
      author: "Hana",

      journeyUpdates: []
    }
  ];

  /*
  =========================================================
  SEARCH
  =========================================================
  */

  const filteredDestinations = destinations.filter((destination) => {
    const text =
      `${destination.name} ${destination.country} ${destination.description}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  /*
  =========================================================
  DESTINATION DETAILS
  =========================================================
  */

  if (selectedDestination) {
    const updates = selectedDestination.journeyUpdates || [];

    return (
      <main className="destination-details-page">

        {/* BACK BUTTON */}
        <button
          type="button"
          className="destination-back-button"
          onClick={() => setSelectedDestination(null)}
        >
          ← Back to Explore
        </button>

        {/* =================================================
            DESTINATION HEADER
        ================================================= */}

        <section className="destination-details-header">

          <div className="destination-details-header-image">
            <img
              src={selectedDestination.image}
              alt={selectedDestination.name}
            />

            <div className="destination-image-overlay">
              <span>{selectedDestination.country}</span>
              <h1>{selectedDestination.name}</h1>
            </div>
          </div>

          <div className="destination-details-intro">

            <span className="destination-details-label">
              TRIPSTORIES JOURNEY
            </span>

            <h2>
              {selectedDestination.author}'s journey through{" "}
              <em>{selectedDestination.name}.</em>
            </h2>

            <p>
              Follow the journey as {selectedDestination.author} visits
              different places, shares photographs and records special
              moments along the way.
            </p>

            <div className="destination-author-box">

              <div className="destination-author-avatar">
                {selectedDestination.author.charAt(0)}
              </div>

              <div>
                <span>JOURNEY BY</span>
                <strong>{selectedDestination.author}</strong>
              </div>

            </div>

            <div className="destination-actions">

              <button
                type="button"
                className="destination-action follow"
                onClick={() =>
                  alert(
                    `You are now following ${selectedDestination.author}.`
                  )
                }
              >
                + Follow {selectedDestination.author}
              </button>

              <button
                type="button"
                className="destination-action"
                onClick={(event) => {
                  event.currentTarget.classList.toggle("liked");
                }}
              >
                ♡ Like
              </button>

              <button
                type="button"
                className="destination-action"
                onClick={() => {
                  const shareText =
                    `Follow ${selectedDestination.author}'s journey to ${selectedDestination.name} on TripStories.`;

                  if (navigator.share) {
                    navigator.share({
                      title: `${selectedDestination.name} - TripStories`,
                      text: shareText
                    });
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareText);
                    alert("Journey link copied!");
                  }
                }}
              >
                ↗ Share
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            JOURNEY TIMELINE
        ================================================= */}

        <section className="journey-updates-section">

          <div className="journey-section-heading">

            <div>
              <span>LIVE JOURNEY</span>

              <h2>
                {selectedDestination.author}'s{" "}
                <em>travel diary.</em>
              </h2>
            </div>

            <p>
              Every update captures another place, another moment and
              another memory from the journey.
            </p>

          </div>

          {updates.length === 0 ? (

            /*
            =================================================
            NO UPDATE
            =================================================
            */

            <div className="no-journey-update">

              <div className="no-update-icon">
                ✦
              </div>

              <span>JOURNEY UPDATE</span>

              <h3>
                Wait for the update from {selectedDestination.author}
              </h3>

              <p>
                {selectedDestination.author} hasn't shared a journey
                update yet. New photographs, places, stories and
                experiences will appear here when the journey begins.
              </p>

            </div>

          ) : (

            /*
            =================================================
            MULTIPLE JOURNEY UPDATES
            =================================================
            */

            <div className="journey-timeline">

              {updates.map((update, index) => (

                <JourneyUpdate
                  key={update.id}
                  update={update}
                  number={index + 1}
                  author={selectedDestination.author}
                />

              ))}

            </div>

          )}

        </section>

      </main>
    );
  }

  /*
  =========================================================
  MAIN EXPLORE PAGE
  =========================================================
  */

  return (
    <main className="explore-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="explore-hero">

        <div className="explore-hero-content">

          <span className="explore-eyebrow">
            DISCOVER THE WORLD
          </span>

          <h1>
            Find your next
            <br />
            <em>story.</em>
          </h1>

          <p>
            Explore places worth visiting, discover new experiences
            and find inspiration for your next journey.
          </p>

          <div className="explore-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

        </div>

        <div className="explore-hero-image">

          <img
            src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=85"
            alt="Travel destination"
          />

        </div>

      </section>

      {/* =================================================
          DESTINATIONS
      ================================================= */}

      <section className="destinations-section">

        <div className="destinations-heading">

          <div>

            <span>PLACES TO EXPLORE</span>

            <h2>
              Go somewhere
              <br />
              <em>beautiful.</em>
            </h2>

          </div>

          <p>
            From quiet mountain towns to unforgettable cities,
            discover a destination that feels like yours.
          </p>

        </div>

        {filteredDestinations.length === 0 ? (

          <div className="explore-empty">

            <span>✦</span>

            <h3>
              No destinations found
            </h3>

            <p>
              Try searching for another place.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
            >
              Show all destinations
            </button>

          </div>

        ) : (

          <div className="destinations-grid">

            {filteredDestinations.map((destination) => (

              <article
                className="destination-card"
                key={destination.id}
              >

                <div className="destination-image">

                  <img
                    src={destination.image}
                    alt={destination.name}
                  />

                </div>

                <div className="destination-content">

                  <span className="destination-country">
                    {destination.country}
                  </span>

                  <h3>
                    {destination.name}
                  </h3>

                  <p>
                    {destination.description}
                  </p>

                  <button
                    type="button"
                    className="destination-button"
                    onClick={() =>
                      setSelectedDestination(destination)
                    }
                  >
                    Explore journey
                    <span>→</span>
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* =================================================
          QUOTE
      ================================================= */}

      <section className="explore-quote">

        <span>THE WORLD IS WAITING</span>

        <blockquote>
          “Collect moments,
          <br />
          not things.”
        </blockquote>

      </section>

      {/* =================================================
          FINAL CTA
      ================================================= */}

      <section className="explore-cta">

        <div>

          <span>READY TO GO?</span>

          <h2>
            Your next adventure
            <br />
            is <em>out there.</em>
          </h2>

        </div>

      </section>

    </main>
  );
}


/*
=========================================================
JOURNEY UPDATE COMPONENT
=========================================================
*/

function JourneyUpdate({ update, number, author }) {

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const addComment = () => {

    if (!comment.trim()) {
      return;
    }

    const now = new Date();

    const newComment = {
      id: Date.now(),
      text: comment.trim(),
      date: now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      time: now.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
    };

    setComments((previous) => [
      ...previous,
      newComment
    ]);

    setComment("");
  };

  const deleteComment = (id) => {

    setComments((previous) =>
      previous.filter((item) => item.id !== id)
    );

  };

  return (
    <article className="journey-update-card">

      {/* TIMELINE NUMBER */}

      <div className="journey-number">
        <span>
          {String(number).padStart(2, "0")}
        </span>
      </div>

      {/* UPDATE CONTENT */}

      <div className="journey-update-content">

        <div className="journey-update-top">

          <div>

            <span className="journey-update-label">
              JOURNEY UPDATE
            </span>

            <h3>
              {update.place}
            </h3>

          </div>

          <div className="journey-update-date">

            <strong>
              {update.date}
            </strong>

            <span>
              {update.time}
            </span>

          </div>

        </div>

        {/* IMAGE */}

        <div className="journey-update-image">

          <img
            src={update.image}
            alt={update.place}
          />

          <div className="journey-photo-tag">
            PHOTO • {author}
          </div>

        </div>

        {/* STORY */}

        <div className="journey-update-story">

          <span>ABOUT THIS MOMENT</span>

          <p>
            {update.text}
          </p>

        </div>

        {/* COMMENTS */}

        <div className="journey-comments">

          <div className="comments-heading">

            <div>
              <span>TRAVEL CHAT</span>

              <h4>
                Talk about this journey
              </h4>
            </div>

            <strong>
              {comments.length}{" "}
              {comments.length === 1
                ? "comment"
                : "comments"}
            </strong>

          </div>

          {/* COMMENT INPUT */}

          <div className="comment-input-area">

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              placeholder="Write a message about this journey..."
              rows="3"
            />

            <button
              type="button"
              onClick={addComment}
              disabled={!comment.trim()}
            >
              Send message →
            </button>

          </div>

          {/* COMMENTS */}

          {comments.length === 0 ? (

            <div className="empty-comments">

              <span>♡</span>

              <p>
                No messages yet.
              </p>

              <small>
                Start the conversation about this journey.
              </small>

            </div>

          ) : (

            <div className="comments-list">

              {comments.map((item) => (

                <div
                  className="comment-item"
                  key={item.id}
                >

                  <div className="comment-avatar">
                    Y
                  </div>

                  <div className="comment-main">

                    <div className="comment-meta">

                      <strong>
                        You
                      </strong>

                      <span>
                        {item.date} • {item.time}
                      </span>

                    </div>

                    <p>
                      {item.text}
                    </p>

                    <button
                      type="button"
                      className="delete-comment"
                      onClick={() =>
                        deleteComment(item.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </article>
  );
}

export default Explore;