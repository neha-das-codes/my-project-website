const CLOUDINARY_CONFIG = {
  cloudName: 'dnyif6mso', // Replace with your cloud name
  uploadPreset: 'chat_uploads' // Replace with your upload preset
};

// Upload file to Cloudinary
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (files) => {
  const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

// Validate file before upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ]
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size should not exceed ${formatFileSize(maxSize)}`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not supported`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type
export const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'file';
};

// Create preview for image files
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};