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
      console.log(`Starting to merge ${pdfFiles.length} PDF files in specified order`);
      
      // Validate files
      if (!pdfFiles || pdfFiles.length === 0) {
        throw new Error('No files provided for merging');
      }
      
      // Make sure all files are valid
      pdfFiles.forEach((file, i) => {
        if (!file) {
          throw new Error(`File at position ${i+1} is undefined`);
        }
        if (!file.name) {
          throw new Error(`File at position ${i+1} is not a valid File object`);
        }
      });
      
      // Create a new PDF document
      const mergedPdf = await PDFLib.PDFDocument.create();
      
      // Process files in the order they appear in the array
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfFile = pdfFiles[i];
        console.log(`Processing file ${i+1}/${pdfFiles.length}: ${pdfFile.name}`);
        
        const pdfBytes = await readFileAsArrayBuffer(pdfFile);
        const pdf = await PDFLib.PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      
      console.log('PDF merge completed successfully');
      const mergedPdfFile = await mergedPdf.save();
      return mergedPdfFile;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw error;
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

// Remove the standalone mergePdfs function - it's duplicating functionality