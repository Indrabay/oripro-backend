const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Supported image MIME types
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Supported image file extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Check if a file is an image based on MIME type or extension
 * @param {Object} file - Multer file object
 * @returns {boolean}
 */
function isImageFile(file) {
  if (!file) return false;
  
  // Check MIME type
  if (file.mimetype && IMAGE_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    return true;
  }
  
  // Check file extension as fallback
  const ext = path.extname(file.originalname || file.filename || '').toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Compress an image file
 * @param {string} filePath - Path to the image file
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Path to the compressed file
 */
async function compressImage(filePath, options = {}) {
  const {
    quality = 80,           // JPEG/WebP quality (1-100)
    maxWidth = 1920,        // Maximum width in pixels
    maxHeight = 1920,       // Maximum height in pixels
    format = null           // Output format (null = keep original)
  } = options;

  try {
    const metadata = await sharp(filePath).metadata();
    
    // Determine output format
    let outputFormat = format || metadata.format;
    if (outputFormat === 'jpeg') outputFormat = 'jpg';
    
    // Calculate new dimensions while maintaining aspect ratio
    let width = metadata.width;
    let height = metadata.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    // Prepare sharp pipeline
    let pipeline = sharp(filePath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    
    // Apply format-specific optimizations
    if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (outputFormat === 'png') {
      pipeline = pipeline.png({ 
        quality,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    } else if (outputFormat === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (outputFormat === 'gif') {
      // GIF compression is limited, just resize
      pipeline = pipeline.gif();
    }
    
    // Get output path (same file, overwrite)
    const outputPath = filePath;
    
    // Compress and save
    await pipeline.toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, return original path
    return filePath;
  }
}

/**
 * Middleware to compress uploaded images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function compressUploadedImages(req, res, next) {
  try {
    // Handle single file upload
    if (req.file && isImageFile(req.file)) {
      await compressImage(req.file.path, {
        quality: 80,
        maxWidth: 1920,
        maxHeight: 1920
      });
    }
    
    // Handle multiple files upload
    if (req.files) {
      const fileArrays = Object.values(req.files).flat();
      
      for (const file of fileArrays) {
        if (isImageFile(file)) {
          await compressImage(file.path, {
            quality: 80,
            maxWidth: 1920,
            maxHeight: 1920
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in compressUploadedImages middleware:', error);
    // Continue even if compression fails
    next();
  }
}

module.exports = {
  compressImage,
  compressUploadedImages,
  isImageFile
};

