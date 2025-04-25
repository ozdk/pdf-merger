/**
 * PDF merger functionality using PDF-lib
 */
const pdfMerger = {
  /**
   * Merge multiple PDF files into one
   * @param {File[]} pdfFiles - Array of PDF files to merge
   * @returns {Promise<Uint8Array>} - The merged PDF as binary data
   */
  async mergePDFs(pdfFiles) {
    try {
      // Create a new PDF document
      const mergedPdf = await PDFLib.PDFDocument.create();
      
      // Process each file
      for (const pdfFile of pdfFiles) {
        try {
          // Read the file as an ArrayBuffer
          const pdfBytes = await pdfFile.arrayBuffer();
          
          // Load the PDF document
          const pdf = await PDFLib.PDFDocument.load(pdfBytes, { 
            ignoreEncryption: true 
          });
          
          // Get page indices
          const indices = Array.from(
            { length: pdf.getPageCount() }, 
            (_, i) => i
          );
          
          // Copy pages to the merged PDF
          const copiedPages = await mergedPdf.copyPages(pdf, indices);
          copiedPages.forEach(page => mergedPdf.addPage(page));
        } catch (fileError) {
          console.error(`Error processing file ${pdfFile.name}:`, fileError);
          throw new Error(`Could not process ${pdfFile.name}: ${fileError.message}`);
        }
      }
      
      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      return mergedPdfBytes;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDF files: ' + error.message);
    }
  },
  
  /**
   * Create a download URL for the merged PDF
   * @param {Uint8Array} pdfBytes - The PDF data
   * @returns {string} - URL for downloading
   */
  createDownloadLink(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  },
  
  /**
   * Create PDF preview
   * @param {Uint8Array} pdfBytes - The PDF data
   * @param {string} containerId - ID of the container element
   */
  async createPDFPreview(pdfBytes, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      // Clear any previous content
      container.innerHTML = '';
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create the iframe with improved attributes for better display
      const iframe = document.createElement('iframe');
      
      // Add parameters to enable PDF viewer controls
      const enhancedUrl = url + '#view=FitH&toolbar=1&navpanes=1';
      iframe.src = enhancedUrl;
      
      // Set additional attributes for proper display
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '100%');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.title = 'PDF Preview';
      
      container.appendChild(iframe);
      
      // Add fallback for browsers with poor PDF support
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'pdf-fallback';
      fallbackDiv.innerHTML = `
        <p>Having trouble viewing the preview? 
        <a href="${url}" target="_blank" rel="noopener noreferrer">Open in new tab</a></p>
      `;
      container.appendChild(fallbackDiv);
      
      return url; // Return URL for cleanup later if needed
    } catch (error) {
      console.error('Error creating PDF preview:', error);
      container.innerHTML = '<div class="preview-error"><p>Unable to display PDF preview</p></div>';
    }
  }
};