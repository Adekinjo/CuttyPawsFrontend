// src/pages/profile/uiHelpers.js
export function toHandle(name = "") {
  const base = name.trim().toLowerCase().replace(/\s+/g, "_");
  return base || "user";
}

export function formatJoined(dateString) {
  if (!dateString) return "Joined —";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Joined —";
  return `Joined ${d.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

export function formatLocation(address) {
  // address could be { city, state } or a string
  if (!address) return "";
  if (typeof address === "string") return address;
  const city = address.city || "";
  const state = address.state || "";
  const out = [city, state].filter(Boolean).join(", ");
  return out;
}
