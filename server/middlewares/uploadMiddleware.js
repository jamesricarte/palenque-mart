const multer = require("multer");
const { isAllowedFileType } = require("../utils/fileUtils");

// Use memory storage to handle files as buffers before uploading to Supabase
const storage = multer.memoryStorage();

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
