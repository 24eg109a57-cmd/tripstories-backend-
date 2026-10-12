import { useState } from "react";
import { Link } from "react-router-dom";

import { createTripStoriesExport } from "../utils/tripStoriesExport";
import "../styles/data-export.css";

function ExportData() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleExport = () => {
    setMessage("");
    setMessageType("");

    try {
      const result = createTripStoriesExport(window.localStorage);
      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      downloadLink.href = objectUrl;
      downloadLink.download = `tripstories-data-${date}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      const summary = [
        `${result.counts.stories} stories`,
        `${result.counts.likedStories} likes`,
        `${result.counts.comments} comments`,
        `${result.counts.following} following`,
        `${result.counts.followers} followers`,
        `${result.counts.savedStories} saved stories`,
      ].join(", ");
      const warningText = result.warnings.length
        ? ` Some data could not be read: ${result.warnings.join(" ")}`
        : "";

      setMessage(
        `Export downloaded (${summary}). Passwords and sign-in tokens were excluded. Existing browser data was not changed.${warningText}`
      );
      setMessageType(result.warnings.length ? "warning" : "success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The data export could not be created."
      );
      setMessageType("error");
    }
  };

  return (
    <main className="data-export-page">
      <section className="data-export-card">
        <span className="data-export-eyebrow">YOUR DATA</span>
        <h1>Export your TripStories data</h1>
        <p>
          Download a JSON copy of the profile, stories, likes, comments,
          follows, and saved stories available in this browser.
        </p>
        <p>
          The file is created on your device. It is not uploaded anywhere.
          Passwords, account lists, and sign-in tokens are excluded, and
          exporting does not change or clear your saved browser data.
        </p>

        <button
          type="button"
          className="data-export-button"
          onClick={handleExport}
        >
          Export Data
        </button>

        {message && (
          <p
            className={`data-export-message data-export-message--${messageType}`}
            role={messageType === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        )}

        <Link className="data-export-back" to="/profile">
          Back to profile
        </Link>
      </section>
    </main>
  );
}

export default ExportData;
