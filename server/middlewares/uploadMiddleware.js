const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const { isAllowedFileType } = require("../utils/fileUtils");

// Create upload directory if it doesn't exist
const createUploadDir = async () => {
  const uploadDir = path.join(__dirname, "../uploads/seller-documents");
  try {
    await fs.access(uploadDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// Initialize upload directory
createUploadDir().catch(console.error);

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/seller-documents");
    try {
      await fs.access(uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      // Directory doesn't exist, create it
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (mkdirError) {
        cb(mkdirError);
      }
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (isAllowedFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and PDF files are allowed.`
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: fileFilter,
});

// Define upload fields
const uploadFields = upload.fields([
  { name: "government_id", maxCount: 1 },
  { name: "selfie_with_id", maxCount: 1 },
  { name: "business_documents", maxCount: 3 },
  { name: "bank_statement", maxCount: 1 },
  { name: "store_logo", maxCount: 1 },
]);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size is 5MB.",
        success: false,
        error: { code: "FILE_TOO_LARGE" },
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files uploaded.",
        success: false,
        error: { code: "TOO_MANY_FILES" },
      });
    }
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      message: error.message,
      success: false,
      error: { code: "INVALID_FILE_TYPE" },
    });
  }

  return res.status(500).json({
    message: "File upload error occurred.",
    success: false,
    error: { code: "UPLOAD_ERROR" },
  });
};

module.exports = {
  uploadFields,
  handleUploadError,
};
