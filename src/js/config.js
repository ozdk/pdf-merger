/**
 * Application configuration
 */
const Config = {
  // PDF.js configuration
  pdfWorkerPath: 'lib/pdf.worker.js',
  
  // File handling settings
  fileTypes: {
    pdf: 'application/pdf'
  },
  
  // UI settings
  fileListLimit: 100,
  previewHeight: 500,
  
  // Default file names
  defaultMergedFilename: 'merged.pdf',
  
  // Debug mode
  debug: false
};

export default Config;