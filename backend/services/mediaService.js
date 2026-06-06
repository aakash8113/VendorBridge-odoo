import imagekit from '../config/imagekit.js';

export const uploadToImageKit = async (fileBuffer, fileName, folder = '/') => {
  try {
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName,
      folder,
      useUniqueFileName: true,
    });
    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error.message);
    throw new Error('Failed to upload file to ImageKit');
  }
};

export const deleteFromImageKit = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error('ImageKit delete error:', error.message);
    throw new Error('Failed to delete file from ImageKit');
  }
};
