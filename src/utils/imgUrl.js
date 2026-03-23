/**
 * Resolves an image path relative to the app's base URL.
 * - Absolute URLs (http/https/data:) are returned as-is.
 * - Root-relative paths like '/logo.webp' are mapped to the public/images/
 *   subfolder and prefixed with import.meta.env.BASE_URL, so in production
 *   '/logo.webp' → '/fooddash/images/logo.webp'.
 */
export const imgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) return path;
  // All local images live under public/images/ — normalise the path.
  const norm = path.replace(/^\//, '');
  const sub = norm.startsWith('images/') ? norm : `images/${norm}`;
  return import.meta.env.BASE_URL + sub;
};
