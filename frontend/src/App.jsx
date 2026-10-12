import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import ShareStorys from "./pages/ShareStorys";
import InspiredStories from "./pages/InspiredStories";
import Profile from "./pages/Profile";
import ExportData from "./pages/ExportData";
import { hasValidAccessToken } from "./api";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    hasValidAccessToken()
  );

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(hasValidAccessToken());
    };

    window.addEventListener("storage", checkLogin);
    window.addEventListener("tripstories-auth", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("tripstories-auth", checkLogin);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* NAVBAR IS HERE ONLY ONCE */}
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/explore" element={<Explore />} />

        <Route
          path="/share-story"
          element={<ShareStorys />}
        />

        <Route
          path="/inspired-stories"
          element={<InspiredStories />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/export-data"
          element={<ExportData />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;