/**
 * Append `sp_session` into a FormData payload if available.
 * @param {FormData} formData - Target FormData instance
 * @param {string|number|null|undefined} spSession - Session token to append
 */
export const appendSpSessionToFormData = (formData, spSession) => {
  if (!formData || !spSession) return;
  formData.append('sp_session', spSession);
};

/**
 * Build request URL with `sp_session` as query parameter when available.
 * @param {string} url - Original request URL
 * @param {string|number|null|undefined} spSession - Session token
 * @returns {string} URL with sp_session appended (if applicable)
 */
export const buildUrlWithSpSession = (url, spSession) => {
  if (!url || !spSession) return url;
  if (url.includes('sp_session=')) return url;

  const [pathWithoutHash, hashPart] = url.split('#');
  const separator = pathWithoutHash.includes('?') ? '&' : '?';
  const appended = `${pathWithoutHash}${separator}sp_session=${encodeURIComponent(spSession)}`;

  return hashPart ? `${appended}#${hashPart}` : appended;
};
