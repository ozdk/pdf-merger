/**
 * Utility functions for file handling
 */
const fileUtils = {
  /**
   * Convert bytes to a human-readable format
   * @param {number} bytes - The file size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  },
  
  /**
   * Check if a file is a valid PDF
   * @param {File} file - The file to check
   * @returns {boolean} - True if valid PDF
   */
  isValidPDF(file) {
    return file.type === 'application/pdf';
  },
  
  /**
   * Create a data URL from a File object
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - Data URL
   */
  async fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * Extract file extension from filename
   * @param {string} filename - The filename
   * @returns {string} - The file extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }
};

/**
 * Reads a File object as an ArrayBuffer
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>} - Promise resolving to the file's contents as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}