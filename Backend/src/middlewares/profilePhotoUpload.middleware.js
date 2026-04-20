import fs from 'fs';
import path from 'path';
import multer from 'multer';

const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profile-images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.jpg';
    const userId = req.user?.userId || 'user';
    const uniquePart = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${userId}-${uniquePart}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    const error = new Error('Only JPG, PNG, and WEBP images are allowed');
    error.statusCode = 400;
    return cb(error);
  }
  return cb(null, true);
};

const profilePhotoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_PROFILE_PHOTO_SIZE_BYTES,
  },
});

export {
  profilePhotoUpload,
  MAX_PROFILE_PHOTO_SIZE_BYTES,
};
