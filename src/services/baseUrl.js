/**
 * Get the base URL for file uploads
 * Uses BASE_URL_DOMAIN environment variable if set, otherwise falls back to req host
 * @param {Object} req - Express request object (optional)
 * @returns {string} Base URL for file uploads
 */
function getBaseUrl(req = null) {
  // Check for BASE_URL_DOMAIN or baseUrlDOmain (supporting user's exact naming)
  const baseUrlDomain = process.env.BASE_URL_DOMAIN || process.env.baseUrlDOmain;
  
  if (baseUrlDomain) {
    // Remove trailing slash if present
    return baseUrlDomain.replace(/\/$/, '');
  }
  
  // Fallback to request host if req is provided
  if (req) {
    return req.protocol + '://' + req.get('host');
  }
  
  // Final fallback
  return process.env.APP_BASE_URL || 'http://localhost:3000';
}

/**
 * Get the full URL for an upload file
 * @param {string} filePath - Relative path from uploads directory (e.g., 'user-task-evidence/file.jpg')
 * @param {Object} req - Express request object (optional)
 * @returns {string} Full URL to the file
 */
function getUploadUrl(filePath, req = null) {
  const baseUrl = getBaseUrl(req);
  // Remove leading slash from filePath if present
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  return `${baseUrl}/uploads/${cleanPath}`;
}

/**
 * Transform image URLs to use BASE_URL_DOMAIN if set
 * Replaces any URL containing /uploads with the base URL from environment
 * @param {string} url - Original URL
 * @returns {string} Transformed URL
 */
function transformImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Check if URL contains /uploads
  if (!url.includes('/uploads')) {
    return url;
  }

  // Get base URL from environment
  const baseUrlDomain = process.env.BASE_URL_DOMAIN || process.env.baseUrlDOmain;
  
  if (!baseUrlDomain) {
    // If no base URL is set, return original URL
    return url;
  }

  // Remove trailing slash from base URL
  const baseUrl = baseUrlDomain.replace(/\/$/, '');
  
  // Extract the path after /uploads
  const uploadsIndex = url.indexOf('/uploads');
  if (uploadsIndex === -1) {
    return url;
  }
  
  const uploadsPath = url.substring(uploadsIndex);
  return `${baseUrl}${uploadsPath}`;
}

/**
 * Transform an array of URLs or a single URL
 * @param {string|string[]|null|undefined} urls - URL(s) to transform
 * @returns {string|string[]|null|undefined} Transformed URL(s)
 */
function transformImageUrls(urls) {
  if (!urls) {
    return urls;
  }
  
  if (Array.isArray(urls)) {
    return urls.map(url => transformImageUrl(url));
  }
  
  return transformImageUrl(urls);
}

/**
 * Transform URLs in evidence objects (objects with url property)
 * @param {Object|Object[]|null|undefined} evidences - Evidence object(s) to transform
 * @returns {Object|Object[]|null|undefined} Transformed evidence object(s)
 */
function transformEvidenceUrls(evidences) {
  if (!evidences) {
    return evidences;
  }
  
  if (Array.isArray(evidences)) {
    return evidences.map(evidence => {
      if (evidence && typeof evidence === 'object' && evidence.url) {
        return {
          ...evidence,
          url: transformImageUrl(evidence.url)
        };
      }
      return evidence;
    });
  }
  
  if (evidences && typeof evidences === 'object' && evidences.url) {
    return {
      ...evidences,
      url: transformImageUrl(evidences.url)
    };
  }
  
  return evidences;
}

module.exports = {
  getBaseUrl,
  getUploadUrl,
  transformImageUrl,
  transformImageUrls,
  transformEvidenceUrls
};
