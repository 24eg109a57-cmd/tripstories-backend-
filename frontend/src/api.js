const configuredApiUrl = import.meta.env?.VITE_API_URL?.trim();
const defaultApiUrl = "https://tripstories-backend.onrender.com";
const ACCESS_TOKEN_KEY = "tripStoriesAccessToken";
const SESSION_USER_KEY = "tripStoriesSessionUser";

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");

export function hasValidAccessToken() {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    return false;
  }

  try {
    const encodedClaims = token.split(".")[1];
    const normalizedClaims = encodedClaims
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedClaims = normalizedClaims.padEnd(
      Math.ceil(normalizedClaims.length / 4) * 4,
      "="
    );
    const claims = JSON.parse(atob(paddedClaims));

    return Number.isFinite(claims.exp) && claims.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getSessionUser() {
  const serializedUser = sessionStorage.getItem(SESSION_USER_KEY);

  if (!serializedUser) {
    return null;
  }

  try {
    return JSON.parse(serializedUser);
  } catch {
    return null;
  }
}

export function saveAuthSession(authResponse) {
  if (
    !authResponse?.accessToken ||
    !authResponse?.user ||
    typeof authResponse.user !== "object"
  ) {
    throw new Error("The server returned an invalid sign-in response.");
  }

  const user = {
    ...authResponse.user,
    name: authResponse.user.username || authResponse.user.name || "Traveler",
  };

  sessionStorage.setItem(ACCESS_TOKEN_KEY, authResponse.accessToken);
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("tripstories-auth"));
}

export function clearAuthSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
  window.dispatchEvent(new Event("tripstories-auth"));
}

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error(
      "The backend URL is not configured. Set VITE_API_URL in the frontend hosting settings."
    );
  }

  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  const isAuthenticationRequest = path.startsWith("/api/auth/");

  if (options.body != null && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = !isAuthenticationRequest
    ? sessionStorage.getItem(ACCESS_TOKEN_KEY)
    : null;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    { ...options, headers }
  );

  if (!response.ok) {
    if (response.status === 401 && !isAuthenticationRequest) {
      clearAuthSession();
      throw new Error(
        "Your sign-in has expired or is no longer valid. Please sign in again."
      );
    }

    const message = response.status === 401
      ? "Email or password is incorrect."
      : response.status === 409
        ? "An account with this email already exists."
        : `API request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
