import { Link } from "react-router-dom";
import "../styles/home.css";

export const stories = [
  {
    id: 1,
    title: "Monsoon Notes from Munnar",
    location: "Munnar, Kerala",
    type: "Friends",
    author: "Ananya",
    image:
      "https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?auto=format&fit=crop&w=1200&q=85",
    photos: [
      "https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1742106854691-014b06968f74?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1696027356970-b1527cc0d33c?auto=format&fit=crop&w=1200&q=85",
    ],
    description:
      "Tea trails, cloud forests and the kind of quiet you carry home.",
  },
  {
    id: 2,
    title: "My Trip to Munnar",
    location: "Munnar, Kerala",
    type: "Friends",
    author: "Arjun",
    image:
      "https://images.unsplash.com/photo-1742286087579-fcaa5ed24c35?auto=format&fit=crop&w=1200&q=85",
    photos: [
      "https://images.unsplash.com/photo-1742106854691-014b06968f74?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1696027356970-b1527cc0d33c?auto=format&fit=crop&w=1200&q=85",
    ],
    description:
      "A misty reset among tea gardens and winding roads.",
  },
  {
    id: 3,
    title: "A Slow Weekend in Goa",
    location: "Goa, India",
    type: "Couple",
    author: "Dev",
    image:
      "https://images.unsplash.com/photo-1715322001435-0954aa0ff87c?auto=format&fit=crop&w=1200&q=85",
    photos: [
      "https://images.unsplash.com/photo-1715322001435-0954aa0ff87c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1656052898500-104589c701c0?auto=format&fit=crop&w=1200&q=85",
    ],
    description:
      "A beach town itinerary for people who would rather linger than rush.",
  },
  {
    id: 4,
    title: "Chasing Waterfalls in Meghalaya",
    location: "Meghalaya, India",
    type: "Friends",
    author: "Meera",
    image:
      "https://images.unsplash.com/photo-1723732523830-ac239cdd2121?auto=format&fit=crop&w=1200&q=85",
    photos: [
      "https://images.unsplash.com/photo-1707219004247-0657a598a23d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1723562484559-69463f5bacb0?auto=format&fit=crop&w=1200&q=85",
    ],
    description:
      "Three waterfalls, one borrowed car and a lot of rain-soaked laughter.",
  },
  {
    id: 5,
    title: "A Week in Kashmir",
    location: "Kashmir, India",
    type: "Solo",
    author: "Rahul",
    image:
      "https://images.unsplash.com/photo-1662887564708-6c1bcad4565c?auto=format&fit=crop&w=1200&q=85",
    photos: [
      "https://images.unsplash.com/photo-1662887564708-6c1bcad4565c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1569852837213-00d97a707a83?auto=format&fit=crop&w=1200&q=85",
    ],
    description:
      "From waking up beside Dal Lake to watching the sunset in Gulmarg.",
  },
  {
    id: 6,
    title: "The Long Way to Ladakh",
    location: "Ladakh, India",
    type: "Backpacking",
    author: "Arjun",
    image:
      "https://images.unsplash.com/photo-1701599346665-88d37f67fed0?auto=format&fit=crop&w=1200&q=85",
    photos: [
      "https://images.unsplash.com/photo-1701599346665-88d37f67fed0?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1744528554436-14ecb654d0f0?auto=format&fit=crop&w=1200&q=85",
    ],
    description:
      "High passes, chai stops and a road that kept opening into another horizon.",
  },
];

function StoryCard({ story }) {
  return (
    <article className="home-story-card">
      <div className="home-story-image">
        <img src={story.image} alt={story.title} />

        <span className="home-story-tag">
          {story.type}
        </span>

        <button className="home-save" aria-label="Save story">
          ♡
        </button>
      </div>

      <div className="home-story-content">
        <div className="home-location">
          <span>⌖</span>
          {story.location}
        </div>

        <h3>{story.title}</h3>

        <p>{story.description}</p>

        <div className="home-card-footer">
          <div className="home-author">
            <span className="home-author-avatar">
              {story.author.charAt(0)}
            </span>

            {story.author}
          </div>

          <Link
            to="/inspired-stories"
            state={{ selectedStory: story }}
            className="home-read-link"
          >
            Read story →
          </Link>
        </div>
      </div>
    </article>
  );
}

function Home() {
  return (
    <main className="home-page">

      {/* HERO */}

      <section className="home-hero">
        <div className="home-hero-copy">

          <span className="home-eyebrow">
            ✦ TRAVEL STORIES, TOLD SLOWLY
          </span>

          <h1>
            Go somewhere.
            <br />
            <em>Come back with a story.</em>
          </h1>

          <p>
            TripStories is a place for the little moments that
            make a destination stay with you — a hidden café,
            a rainy road, a sunset you almost missed.
          </p>

          <div className="home-hero-actions">

            <Link
              to="/share-story"
              className="home-primary-button"
            >
              Share your story
              <span>↗</span>
            </Link>

            <Link
              to="/explore"
              className="home-secondary-button"
            >
              Explore places
              <span>→</span>
            </Link>

          </div>
        </div>

        <div className="home-hero-visual">

          <div className="home-hero-image-main">
            <img
              src="https://images.unsplash.com/photo-1662887564708-6c1bcad4565c?auto=format&fit=crop&w=1400&q=90"
              alt="Kashmir mountains"
            />

            <div className="home-hero-image-label">
              <span>PHOTO DISCOVERY</span>
              <strong>Kashmir, India</strong>
            </div>
          </div>

          <div className="home-hero-small-image">
            <img
              src="https://images.unsplash.com/photo-1715322001435-0954aa0ff87c?auto=format&fit=crop&w=600&q=85"
              alt="Goa"
            />

            <span>Goa, India</span>
          </div>

          <div className="home-hero-note">
            <span>01</span>

            <p>
              Places become memories when someone
              tells you how they felt.
            </p>
          </div>

        </div>
      </section>


      {/* LATEST STORIES */}

      <section className="home-section home-latest">

        <div className="home-section-heading">

          <div>
            <span className="home-eyebrow">
              ▪ JUST PUBLISHED
            </span>

            <h2>Latest stories</h2>
          </div>

          <Link
            to="/inspired-stories"
            className="home-view-link"
          >
            View all stories →
          </Link>

        </div>

        <div className="home-story-grid">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
            />
          ))}
        </div>

      </section>


      {/* TRENDING */}

      <section className="home-section home-trending">

        <div className="home-section-heading">

          <div>
            <span className="home-eyebrow orange">
              ✦ GETTING ATTENTION
            </span>

            <h2>Trending stories</h2>
          </div>

          <p>
            The stories travelers are saving,
            sharing and talking about right now.
          </p>

        </div>

        <div className="home-trending-grid">

          <Link
            to="/inspired-stories"
            className="home-trending-main"
          >
            <img
              src="https://images.unsplash.com/photo-1662887564708-6c1bcad4565c?auto=format&fit=crop&w=1400&q=90"
              alt="A Week in Kashmir"
            />

            <div className="home-trending-overlay">

              <span className="home-location">
                ⌖ Kashmir, India
              </span>

              <h3>A Week in Kashmir</h3>

              <p>
                From waking up beside Dal Lake to watching
                the sunset in Gulmarg, Kashmir felt like a
                story I had stepped inside.
              </p>

              <div className="home-trending-author">

                <span className="home-author-avatar">
                  R
                </span>

                Rahul

                <span className="home-trending-arrow">
                  Read story →
                </span>

              </div>
            </div>
          </Link>


          <div className="home-trending-side">

            <Link
              to="/inspired-stories"
              className="home-trending-small"
            >
              <img
                src="https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?auto=format&fit=crop&w=800&q=85"
                alt="Munnar"
              />

              <div>
                <span>Munnar, India</span>

                <h3>
                  Monsoon Notes
                  <br />
                  from Munnar
                </h3>

                <small>
                  128 likes · 24 comments
                </small>
              </div>
            </Link>


            <Link
              to="/inspired-stories"
              className="home-trending-small"
            >
              <img
                src="https://images.unsplash.com/photo-1715322001435-0954aa0ff87c?auto=format&fit=crop&w=800&q=85"
                alt="Goa"
              />

              <div>
                <span>Goa, India</span>

                <h3>
                  A Slow Weekend
                  <br />
                  in Goa
                </h3>

                <small>
                  173 likes · 38 comments
                </small>
              </div>
            </Link>

          </div>
        </div>

      </section>


      {/* INSPIRATION */}

      <section className="home-inspiration">

        <div className="home-inspiration-heading">

          <span className="home-eyebrow orange">
            ✦ INSPIRE
          </span>

          <h2>
            A glimpse can
            <br />
            change the whole
            <br />
            <em>itinerary.</em>
          </h2>

          <p>
            Photos from travelers who noticed the light,
            took the side street and pressed share before
            the moment disappeared.
          </p>

        </div>


        <div className="home-photo-collage">

          <div className="home-photo photo-one">
            <img
              src="https://images.unsplash.com/photo-1701599346665-88d37f67fed0?auto=format&fit=crop&w=700&q=85"
              alt="Mountain"
            />
          </div>

          <div className="home-photo photo-two">
            <img
              src="https://images.unsplash.com/photo-1715322001435-0954aa0ff87c?auto=format&fit=crop&w=700&q=85"
              alt="Goa beach"
            />
          </div>

          <div className="home-photo photo-three">
            <img
              src="https://images.unsplash.com/photo-1662887564708-6c1bcad4565c?auto=format&fit=crop&w=700&q=85"
              alt="Kashmir"
            />
          </div>

          <div className="home-photo photo-four">
            <img
              src="https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?auto=format&fit=crop&w=700&q=85"
              alt="Munnar"
            />
          </div>

          <div className="home-photo photo-five">
            <img
              src="https://images.unsplash.com/photo-1723732523830-ac239cdd2121?auto=format&fit=crop&w=700&q=85"
              alt="Meghalaya"
            />
          </div>

        </div>


        <div className="home-inspiration-cards">

          <Link
            to="/share-story"
            className="home-inspiration-card dark"
          >
            <span>♥</span>

            <h3>Save the feeling</h3>

            <p>
              Keep the places that make your
              thumb stop scrolling.
            </p>

            <strong>
              Start a story →
            </strong>
          </Link>


          <Link
            to="/inspired-stories"
            className="home-inspiration-card green"
          >
            <span>✣</span>

            <h3>Find your people</h3>

            <p>
              Follow travelers whose pace,
              taste and curiosity feel like yours.
            </p>

            <strong>
              Meet travelers →
            </strong>
          </Link>


          <Link
            to="/explore"
            className="home-inspiration-card cream"
          >
            <span>Next stop</span>

            <h3>Discover a story</h3>

            <p>
              Open the feed and find somewhere
              you had never planned to visit.
            </p>

            <strong>
              Open Explore →
            </strong>
          </Link>

        </div>

      </section>


      {/* PHOTO DISCOVERIES */}

      <section className="home-section home-discoveries">

        <div className="home-section-heading">

          <div>
            <span className="home-eyebrow">
              ▪ SEEN BY THE COMMUNITY
            </span>

            <h2>Photo discoveries</h2>
          </div>

          <p>
            A window into the moments that
            make a place feel real.
          </p>

        </div>


        <div className="home-discovery-grid">

          {[
            {
              location: "Ladakh",
              image:
                "https://images.unsplash.com/photo-1744528554436-14ecb654d0f0?auto=format&fit=crop&w=800&q=85",
            },
            {
              location: "Goa",
              image:
                "https://images.unsplash.com/photo-1715322001435-0954aa0ff87c?auto=format&fit=crop&w=800&q=85",
            },
            {
              location: "Kashmir",
              image:
                "https://images.unsplash.com/photo-1662887564708-6c1bcad4565c?auto=format&fit=crop&w=800&q=85",
            },
          ].map((photo, index) => (

            <Link
              to="/explore"
              className={`home-discovery-photo discovery-${index + 1}`}
              key={photo.location}
            >

              <img
                src={photo.image}
                alt={photo.location}
              />

              <div className="home-discovery-overlay">
                <span>⌖ {photo.location}</span>
                <strong>Explore →</strong>
              </div>

            </Link>

          ))}

        </div>

      </section>


      {/* FINAL CTA */}

      <section className="home-final-cta">

        <div>

          <span className="home-eyebrow orange">
            ✦ YOUR TURN
          </span>

          <h2>
            There is a story
            <br />
            waiting in your camera roll.
          </h2>

          <p>
            It doesn't have to be a perfect trip.
            Tell us about the tiny moment you'll remember.
          </p>

          <Link
            to="/share-story"
            className="home-primary-button"
          >
            Leave a little trail
            <span>↗</span>
          </Link>

        </div>

        <div className="home-final-decoration">
          <span>✦</span>
          <span>01</span>
          <span>TRIPSTORIES</span>
        </div>

      </section>


      {/* FOOTER */}

      <footer className="home-footer">

        <div className="home-footer-logo">
          <span>✦</span>
          TripStories
        </div>

        <p>
          Stories make places feel closer.
        </p>

        <div className="home-footer-links">
          <Link to="/explore">Explore</Link>
          <Link to="/inspired-stories">Stories</Link>
          <Link to="/share-story">Share</Link>
          <Link to="/profile">Profile</Link>
        </div>

      </footer>

    </main>
  );
}

export default Home;