const fs = require("fs")
const path = require("path")

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path to create
 */
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Delete file if it exists
 * @param {string} filePath - File path to delete
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename to extract extension from
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase()
}

/**
 * Check if file type is allowed
 * @param {string} mimetype - File mimetype
 * @returns {boolean} Whether file type is allowed
 */
const isAllowedFileType = (mimetype) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
  return allowedTypes.includes(mimetype)
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

module.exports = {
  createDirectory,
  deleteFile,
  getFileExtension,
  isAllowedFileType,
  formatFileSize,
}
