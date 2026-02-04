const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'eventhub_uploads';

export const uploadImage = async (file, folder = 'events') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `eventhub/${folder}`);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      thumbnailUrl: data.eager?.[0]?.secure_url || data.secure_url,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, folder = 'events') => {
  const uploadPromises = files.map(file => uploadImage(file, folder));
  return Promise.all(uploadPromises);
};

export const deleteImage = async (publicId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cloudinary/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ publicId }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export const validateImage = (file, options = {}) => {
  const { maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  const maxSizeBytes = maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize}MB`,
    };
  }
  
  return { valid: true };
};