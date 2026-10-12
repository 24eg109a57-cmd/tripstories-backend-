export function mapApiStory(story, currentUserEmail = "") {
  const photos = Array.isArray(story?.photos)
    ? story.photos.filter((photo) => typeof photo === "string" && photo.length > 0)
    : [];
  const createdAt = story?.createdAt ? new Date(story.createdAt) : null;
  const author = story?.authorName || "Traveler";

  return {
    id: story.id,
    author,
    authorEmail: story.authorEmail || "",
    avatar: author.charAt(0).toUpperCase(),
    location: story.destination || "Travel destination",
    date: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Recently",
    title: story.title || "My travel story",
    text: story.text || "",
    photos,
    image: photos[0] || "",
    likes: Number(story.likes) || 0,
    comments: Number(story.commentCount) || 0,
    saved: false,
    isMine: Boolean(
      currentUserEmail &&
      story.authorEmail?.toLowerCase() === currentUserEmail.toLowerCase()
    ),
    isRemote: true,
  };
}
