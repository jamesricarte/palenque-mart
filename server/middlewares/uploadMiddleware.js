const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/seller-documents");
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}_${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
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
  },
  fileFilter: fileFilter,
});

// Define the fields that can be uploaded
const uploadFields = upload.fields([
  { name: "government_id", maxCount: 1 },
  { name: "selfie_with_id", maxCount: 1 },
  { name: "business_documents", maxCount: 1 },
  { name: "bank_statement", maxCount: 1 },
  { name: "store_logo", maxCount: 1 },
]);

module.exports = {
  uploadFields,
  upload,
};
