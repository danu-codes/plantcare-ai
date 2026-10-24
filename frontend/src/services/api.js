
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getErrorMessage(detail) {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || "Invalid request")
      .join(", ");
  }

  return "Unable to analyze the image.";
}

export function validateImage(file) {
  if (!file) {
    return "Please choose a leaf image.";
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG and WebP images are supported.";
  }

  if (file.size === 0) {
    return "The selected image is empty.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Image must be smaller than 5 MB.";
  }

  return null;
}

export async function predictDisease(file, signal) {
  const validationError = validateImage(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);

  let response;

  try {
    response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;

    throw new Error(
      "Cannot connect to the AI server. Check that FastAPI is running."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data?.detail));
  }

  if (
    !data ||
    typeof data.predicted_label !== "string" ||
    !Array.isArray(data.predictions)
  ) {
    throw new Error("Unexpected response from the AI server.");
  }

  return data;
}

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend unavailable");
  }

  return response.json();
}
