// Configure PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';
}

/**
 * Main application logic
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const mergeButton = document.getElementById('merge-button');
  const downloadLink = document.getElementById('download-link');
  const resultsSection = document.getElementById('results-section');
  const loadingOverlay = document.getElementById('loading-overlay');
  const fileSizeElement = document.getElementById('file-size');
  const clearFilesButton = document.getElementById('clear-files');
  const startOverButton = document.getElementById('start-over');
  const privacyLink = document.getElementById('privacy-link');
  const privacyModal = document.getElementById('privacy-modal');
  const closeModal = document.querySelector('.close-modal');
  
  // State
  let selectedFiles = [];
  
  // Helper functions
  const updateFileList = () => {
    fileList.innerHTML = '';
    
    if (selectedFiles.length === 0) {
      fileList.innerHTML = '<li class="empty-list">No files selected</li>';
      mergeButton.disabled = true;
      return;
    }
    
    selectedFiles.forEach((file, index) => {
      const li = document.createElement('li');
      
      li.innerHTML = `
        <div class="file-info">
          <span class="file-icon">📄</span>
          <span class="file-name">${file.name}</span>
          <span class="file-size">(${fileUtils.formatFileSize(file.size)})</span>
        </div>
        <div class="file-actions">
          <button class="remove-file" data-index="${index}">✖</button>
        </div>
      `;
      
      fileList.appendChild(li);
    });
    
    // Enable merge button if we have files
    mergeButton.disabled = selectedFiles.length < 1;
    
    // Attach remove event handlers
    document.querySelectorAll('.remove-file').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        selectedFiles.splice(index, 1);
        updateFileList();
      });
    });
  };
  
  const showLoading = () => {
    loadingOverlay.classList.remove('hidden');
  };
  
  const hideLoading = () => {
    loadingOverlay.classList.add('hidden');
  };
  
  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(file => {
      // Check if it's a PDF
      if (!fileUtils.isValidPDF(file)) {
        alert(`"${file.name}" is not a valid PDF file.`);
        return false;
      }
      return true;
    });
    
    // Add new files to selectedFiles array
    selectedFiles = [...selectedFiles, ...newFiles];
    
    // Update the file list
    updateFileList();
  };
  
  const clearFiles = () => {
    selectedFiles = [];
    updateFileList();
  };
  
  const showResults = () => {
    resultsSection.classList.remove('hidden');
  };
  
  const hideResults = () => {
    resultsSection.classList.add('hidden');
  };
  
  const startOver = () => {
    clearFiles();
    hideResults();
    downloadLink.removeAttribute('href');
    downloadLink.textContent = 'Download Merged PDF';
    fileSizeElement.textContent = '--';
    
    // Clear the file input
    fileInput.value = '';
  };
  
  // Event Listeners
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    handleFiles(e.dataTransfer.files);
  });
  
  dropZone.addEventListener('click', (e) => {
    // Don't trigger file input click if the label was clicked
    // This prevents the double-upload dialog
    if (e.target.closest('.file-input-label')) {
      return;
    }
    fileInput.click();
  });
  
  mergeButton.addEventListener('click', async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one PDF file to merge.');
      return;
    }
    
    try {
      showLoading();
      
      // Merge PDFs
      const mergedPdfBytes = await pdfMerger.mergePDFs(selectedFiles);
      
      // Create download link
      const pdfUrl = pdfMerger.createDownloadLink(mergedPdfBytes);
      downloadLink.href = pdfUrl;
      downloadLink.download = selectedFiles.length > 1 ? 'merged.pdf' : selectedFiles[0].name;
      
      // Create preview
      await pdfMerger.createPDFPreview(mergedPdfBytes, 'pdf-preview');
      
      // Update file size
      const fileSizeBytes = mergedPdfBytes.length;
      fileSizeElement.textContent = fileUtils.formatFileSize(fileSizeBytes);
      
      // Show results section
      showResults();
      
      // Track this with an analytics event if you add analytics later
    } catch (error) {
      alert('Error merging PDFs: ' + error.message);
      console.error(error);
    } finally {
      hideLoading();
    }
  });
  
  clearFilesButton.addEventListener('click', clearFiles);
  startOverButton.addEventListener('click', startOver);
  
  // Privacy modal handlers
  privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.classList.remove('hidden');
  });
  
  closeModal.addEventListener('click', () => {
    privacyModal.classList.add('hidden');
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      privacyModal.classList.add('hidden');
    }
  });
  
  // Initialize the file list
  updateFileList();
});