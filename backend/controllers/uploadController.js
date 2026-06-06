import imagekit from '../config/imagekit.js';
import { uploadToImageKit } from '../services/mediaService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUploadAuth = asyncHandler(async (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  return res.json(new ApiResponse(200, authParams, 'Upload auth generated'));
});

export const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.body;
  if (!fileId) {
    return res.status(400).json(new ApiResponse(400, {}, 'fileId is required'));
  }
  await imagekit.deleteFile(fileId);
  return res.json(new ApiResponse(200, {}, 'File deleted'));
});

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, {}, 'No file uploaded'));
  }
  const folder = req.body.folder || '/';
  const result = await uploadToImageKit(req.file.buffer, req.file.originalname, folder);
  return res.json(new ApiResponse(200, result, 'File uploaded successfully'));
});
