const WEBFLOW_API_TOKEN =
  "05d1688f1f6fc96c39fdaeecc8460f947dfc25faa366fb01a311acd7ca813f68";

const WEBFLOW_SITE_ID = "698c7fc57bd0032df85fe610";

export const API_CONFIG = {
  token: WEBFLOW_API_TOKEN,
  siteId: WEBFLOW_SITE_ID,
  baseUrl: "https://api.webflow.com/v2",
};

export const API_ENDPOINTS = {
  products: `${API_CONFIG.baseUrl}/sites/${WEBFLOW_SITE_ID}/products`,
  productDetail: (productId) =>
    `${API_CONFIG.baseUrl}/sites/${WEBFLOW_SITE_ID}/products/${productId}`,
  blogs: `${API_CONFIG.baseUrl}/collections/699ef94f6f55eb951ccc3591/items`,
  blogDetail: (blogId) =>
    `${API_CONFIG.baseUrl}/collections/699ef94f6f55eb951ccc3591/items/${blogId}`,
};
