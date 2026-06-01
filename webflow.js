export const WEBFLOW_TOKEN =
  "17e9ae37f27ed040c0597e7865337070cd7f00a7714c50d8a52901421d0f11d9";

export const WEBFLOW_HEADERS = {
  Authorization: `Bearer ${WEBFLOW_TOKEN}`,
  "Content-Type": "application/json",
};

export const NIEUWS_ITEMS =
  "https://api.webflow.com/v2/collections/6a14302b14f797825db5ce46/items";

export const CAMPUSSEN_ITEMS =
  "https://api.webflow.com/v2/collections/6a12db18e1d9703da639eb3f/items";

export const THEMAS_ITEMS =
  "https://api.webflow.com/v2/collections/6a1429b2b81f34fb341aca99/items";

export const RICHTINGEN_COLLECTION =
  "https://api.webflow.com/v2/collections/6a1429885b4a27b8e08c4d12";

export const RICHTINGEN_ITEMS =
  "https://api.webflow.com/v2/collections/6a1429885b4a27b8e08c4d12/items";

export async function fetchCollection(url) {
  const res = await fetch(url, { headers: WEBFLOW_HEADERS });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}

export async function fetchItems(url) {
  const urlWithLimit = `${url}?limit=100`;
  const res = await fetch(urlWithLimit, { headers: WEBFLOW_HEADERS });
  const text = await res.text();
  if (!res.ok) throw new Error(`Request failed ${res.status}: ${text}`);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${text}`);
  }
}
