import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { apiRequest, saveAuthSession } from "../api";

import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();


    // =====================================================
    // CHECK EMPTY FIELDS
    // =====================================================

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }


    setLoading(true);


    try {
      const authResponse = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      saveAuthSession(authResponse);
      setPassword("");
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="login-page">

      <section className="login-container">


        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <div className="login-intro">

          <Link
            to="/login"
            className="login-logo"
          >
            <span>✦</span>
            TripStories
          </Link>


          <div className="login-intro-content">

            <span className="login-eyebrow">
              WELCOME BACK
            </span>


            <h1>
              Your next
              <br />
              <em>story awaits.</em>
            </h1>


            <p>
              Sign in to explore destinations,
              discover travel stories and share
              your own journey.
            </p>

          </div>

        </div>


        {/* =========================================
            RIGHT SIDE
        ========================================= */}

        <div className="login-form-area">

          <div className="login-form-header">

            <span>
              TRIPSTORIES
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue your journey.
            </p>

          </div>


          {/* =======================================
              FORM
          ======================================= */}

          <form onSubmit={handleLogin}>


            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign in"}

              <span>→</span>

            </button>

          </form>


          {/* =======================================
              SIGNUP
          ======================================= */}

          <div className="login-signup">

            <span>
              Don't have an account?
            </span>

            <Link to="/signup">
              Create an account
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;
