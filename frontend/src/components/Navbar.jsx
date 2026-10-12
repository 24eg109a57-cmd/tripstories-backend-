import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { clearAuthSession } from "../api";

import "../styles/navbar.css";

function Navbar({
  isLoggedIn,
  setIsLoggedIn,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (location.pathname === path) {
      return "navbar-link active";
    }

    return "navbar-link";
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="navbar">

      {/* ==============================
          LOGO
      ============================== */}

      <Link
        to="/"
        className="navbar-logo"
      >
        <span className="navbar-star">
          ✦
        </span>

        <span className="navbar-logo-text">
          TripStories
        </span>
      </Link>


      {/* ==============================
          NAVIGATION
      ============================== */}

      <nav className="navbar-links">

        <Link
          to="/"
          className={isActive("/")}
        >
          Home
        </Link>


        <Link
          to="/explore"
          className={isActive("/explore")}
        >
          Explore
        </Link>


        <Link
          to="/share-story"
          className={isActive("/share-story")}
        >
          Share Storys
        </Link>


        <Link
          to="/inspired-stories"
          className={isActive(
            "/inspired-stories"
          )}
        >
          Inspired Stories
        </Link>


        <Link
          to="/profile"
          className={isActive("/profile")}
        >
          Profile
        </Link>


        {/* ==============================
            LOGIN / LOGOUT
        ============================== */}

        {isLoggedIn ? (

          <button
            type="button"
            className="navbar-login-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        ) : (

          <Link
            to="/login"
            className={
              location.pathname === "/login"
                ? "navbar-login-button active"
                : "navbar-login-button"
            }
          >
            Login
          </Link>

        )}

      </nav>

    </header>
  );
}

export default Navbar;