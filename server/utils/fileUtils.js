const fs = require("fs").promises;
const path = require("path");

/**
 * Create directory if it doesn't exist (async)
 * @param {string} dirPath - Directory path to create
 */
const createDirectory = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Delete file if it exists (async)
 * @param {string} filePath - File path to delete
 * @returns {Promise<boolean>} Whether file was deleted
 */
const deleteFile = async (filePath) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    // File doesn't exist or can't be deleted
    console.warn(`Could not delete file ${filePath}:`, error.message);
    return false;
  }
};

/**
 * Check if file exists (async)
 * @param {string} filePath - File path to check
 * @returns {Promise<boolean>} Whether file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get file stats (async)
 * @param {string} filePath - File path to get stats for
 * @returns {Promise<object|null>} File stats or null if file doesn't exist
 */
const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats;
  } catch (error) {
    return null;
  }
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename to extract extension from
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Check if file type is allowed
 * @param {string} mimetype - File mimetype
 * @returns {boolean} Whether file type is allowed
 */
const isAllowedFileType = (mimetype) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  return allowedTypes.includes(mimetype);
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

/**
 * Clean up multiple files (async)
 * @param {Array<string>} filePaths - Array of file paths to delete
 * @returns {Promise<Array<boolean>>} Array of deletion results
 */
const cleanupFiles = async (filePaths) => {
  const deletePromises = filePaths.map((filePath) => deleteFile(filePath));
  return await Promise.allSettled(deletePromises);
};

/**
 * Move file from source to destination (async)
 * @param {string} sourcePath - Source file path
 * @param {string} destinationPath - Destination file path
 * @returns {Promise<boolean>} Whether file was moved successfully
 */
const moveFile = async (sourcePath, destinationPath) => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    await createDirectory(destDir);

    // Move the file
    await fs.rename(sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error(
      `Error moving file from ${sourcePath} to ${destinationPath}:`,
      error
    );
    return false;
  }
};

/**
 * Copy file from source to destination (async)
 * @param {string} sourcePath - Source file path
 * @param {string} destinationPath - Destination file path
 * @returns {Promise<boolean>} Whether file was copied successfully
 */
const copyFile = async (sourcePath, destinationPath) => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    await createDirectory(destDir);

    // Copy the file
    await fs.copyFile(sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error(
      `Error copying file from ${sourcePath} to ${destinationPath}:`,
      error
    );
    return false;
  }
};

module.exports = {
  createDirectory,
  deleteFile,
  fileExists,
  getFileStats,
  getFileExtension,
  isAllowedFileType,
  formatFileSize,
  cleanupFiles,
  moveFile,
  copyFile,
};
