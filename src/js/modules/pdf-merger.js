/**
 * PDF merging functionality
 */
class PDFMerger {
  constructor() {
    // Configure PDF.js worker if available
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';
    }
  }
  
  /**
   * Helper function to read file as ArrayBuffer
   */
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Merge multiple PDF files
   */
  async mergePDFs(files) {
    if (!files || files.length === 0) {
      throw new Error('No PDF files to merge');
    }
    
    console.log(`Starting to merge ${files.length} PDF files in specified order`);
    
    try {
      // Make sure all files are valid
      files.forEach((file, i) => {
        if (!file) {
          throw new Error(`File at position ${i+1} is undefined`);
        }
        if (!file.name) {
          throw new Error(`File at position ${i+1} is not a valid File object`);
        }
      });
      
      // Create a new PDF document
      const mergedPdf = await PDFLib.PDFDocument.create();
      
      // Process each file in order
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i+1}/${files.length}: ${file.name}`);
        
        try {
          // Use the helper function instead of direct arrayBuffer() call
          const fileArrayBuffer = await this.readFileAsArrayBuffer(file);
          const pdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer);
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          
          // Add each page to the merged PDF
          pages.forEach((page) => {
            mergedPdf.addPage(page);
          });
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          throw new Error(`Failed to process ${file.name}: ${fileError.message}`);
        }
      }
      
      console.log('PDF merge completed successfully');
      return await mergedPdf.save();
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error(`Error merging PDFs: ${error.message}`);
    }
  }
  
  /**
   * Create a download link for the PDF
   */
  createDownloadLink(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }
  
  /**
   * Create a preview of the PDF - use iframe for better compatibility
   */
  async createPDFPreview(pdfBytes, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    try {
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
      
      // Add page count below the iframe
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      loadingTask.promise.then(pdf => {
        const pageCount = pdf.numPages;
        const pageCountElement = document.createElement('div');
        pageCountElement.className = 'page-count';
        pageCountElement.textContent = `${pageCount} ${pageCount === 1 ? 'page' : 'pages'} total`;
        container.appendChild(pageCountElement);
      }).catch(err => {
        console.log('Error getting page count:', err);
      });
      
    } catch (error) {
      console.error('Error creating PDF preview:', error);
      container.innerHTML = `
        <div class="preview-error">
          <p>Error creating preview</p>
          <small>${error.message}</small>
        </div>
      `;
    }
  }
}

export default PDFMerger;