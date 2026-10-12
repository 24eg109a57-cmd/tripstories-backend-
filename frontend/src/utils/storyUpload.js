function dataUrlToBlob(dataUrl) {
  const [metadata, encodedData] = dataUrl.split(",", 2);
  const contentType = metadata.match(
    /^data:(image\/(?:jpeg|png|webp|gif));base64$/
  )?.[1];

  if (!contentType || !encodedData) {
    throw new Error("A selected photo has an unsupported image format.");
  }

  const binary = atob(encodedData);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: contentType });
}

export function createStoryFormData(story, photos) {
  if (photos.length > 6) {
    throw new Error("A story can contain no more than 6 photos.");
  }

  const formData = new FormData();
  formData.append(
    "story",
    new Blob([JSON.stringify(story)], { type: "application/json" })
  );

  photos.forEach((photo, index) => {
    formData.append(
      "photos",
      dataUrlToBlob(photo),
      `trip-story-photo-${index + 1}.jpg`
    );
  });

  return formData;
}
