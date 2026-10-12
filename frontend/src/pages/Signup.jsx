import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveAuthSession } from "../api";

import "../styles/login.css";


function Signup() {

  const navigate = useNavigate();


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  /* =====================================================
     CREATE ACCOUNT
  ===================================================== */

  const handleSignup = async (event) => {

    event.preventDefault();

    setError("");


    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();


    // ===================================================
    // VALIDATION
    // ===================================================

    if (!cleanName) {

      setError(
        "Please enter your name."
      );

      return;
    }


    if (!cleanEmail) {

      setError(
        "Please enter your email."
      );

      return;
    }


    if (password.length < 6) {

      setError(
        "Password must be at least 6 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {
      const authResponse = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          username: cleanName,
          email: cleanEmail,
          password,
        }),
      });

      saveAuthSession(authResponse);
      setPassword("");
      setConfirmPassword("");
      navigate("/", { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create your account."
      );
    } finally {
      setLoading(false);
    }

  };


  return (

    <main className="login-page">


      <section className="login-container">


        {/* =================================================
            LEFT
        ================================================= */}

        <div className="login-intro">

          <Link
            to="/signup"
            className="login-logo"
          >
            <span>✦</span>
            TripStories
          </Link>


          <div className="login-intro-content">

            <span className="login-eyebrow">
              START YOUR JOURNEY
            </span>


            <h1>
              Every journey
              <br />
              has a <em>story.</em>
            </h1>


            <p>
              Create your TripStories account
              and start collecting the places,
              moments and memories worth sharing.
            </p>

          </div>

        </div>



        {/* =================================================
            SIGNUP FORM
        ================================================= */}

        <div className="login-form-area">

          <div className="login-form-header">

            <span>
              TRIPSTORIES
            </span>


            <h2>
              Create account
            </h2>


            <p>
              Join the TripStories community.
            </p>

          </div>


          <form
            onSubmit={handleSignup}
          >


            {/* NAME */}

            <div className="login-field">

              <label htmlFor="name">
                Name
              </label>


              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                autoComplete="name"
              />

            </div>



            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="signup-email">
                Email
              </label>


              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
              />

            </div>



            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="signup-password">
                Password
              </label>


              <input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </div>



            {/* CONFIRM PASSWORD */}

            <div className="login-field">

              <label htmlFor="confirm-password">
                Confirm password
              </label>


              <input
                id="confirm-password"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </div>



            {/* ERROR */}

            {error && (

              <div className="login-error">
                {error}
              </div>

            )}



            {/* CREATE BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create account"}

              <span>→</span>

            </button>

          </form>



          {/* LOGIN */}

          <div className="login-signup">

            <span>
              Already have an account?
            </span>


            <Link to="/login">
              Sign in
            </Link>

          </div>

        </div>

      </section>

    </main>

  );
}


export default Signup;
