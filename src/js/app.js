// Configure PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';
}

// Global variables
let selectedFiles = [];
let selectedFileItem = null;
let fileListElement;
let mergeButton;

/**
 * Format a file size in bytes to a human-readable string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Reset the file input element without adding duplicate listeners
 */
function resetFileInput() {
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    // Just reset the value instead of replacing the element
    fileInput.value = '';
  }
}

/**
 * Clears all selected files and resets the UI
 * IMPORTANT: This function needs to be in global scope
 */
function clearFiles() {
  selectedFiles = [];
  selectedFileItem = null;
  
  if (fileListElement) {
    fileListElement.innerHTML = '<li class="empty-list">No files selected</li>';
  }
  
  if (mergeButton) {
    mergeButton.disabled = true;
  }
  
  // Reset file input value
  resetFileInput();
  
  // Update move button states if the function exists
  if (typeof updateMoveButtonStates === 'function') {
    updateMoveButtonStates();
  }
  
  // Update counter
  document.getElementById('file-counter').textContent = '0 files selected';
}

/**
 * Updates button states based on current selection
 */
function updateMoveButtonStates() {
  const moveUpBtn = document.getElementById('move-up');
  const moveDownBtn = document.getElementById('move-down');
  
  if (!moveUpBtn || !moveDownBtn) return;
  
  // If no selection or no files, disable both buttons
  if (!selectedFileItem || selectedFiles.length <= 1) {
    moveUpBtn.disabled = true;
    moveDownBtn.disabled = true;
    return;
  }
  
  const fileItems = Array.from(fileListElement.children);
  const selectedIndex = fileItems.indexOf(selectedFileItem);
  
  // If invalid selection, disable both
  if (selectedIndex === -1) {
    moveUpBtn.disabled = true;
    moveDownBtn.disabled = true;
    return;
  }
  
  // Update button states based on position
  moveUpBtn.disabled = selectedIndex === 0;
  moveDownBtn.disabled = selectedIndex === fileItems.length - 1;
}

/**
 * Handle file item selection in the list
 */
function handleFileItemSelection(e) {
  const target = e.currentTarget;
  
  // If clicking delete button, don't select the file
  if (e.target.closest('.delete-file')) {
    return;
  }
  
  // Remove selected class from any currently selected item
  if (selectedFileItem) {
    selectedFileItem.classList.remove('selected');
  }
  
  // If clicking the same item, deselect it
  if (selectedFileItem === target) {
    selectedFileItem = null;
  } else {
    // Otherwise, select the new item
    selectedFileItem = target;
    selectedFileItem.classList.add('selected');
  }
  
  updateMoveButtonStates();
}

/**
 * Updates the file list in the UI
 */
function updateFileList() {
  if (!fileListElement) return;
  
  fileListElement.innerHTML = '';
  
  if (selectedFiles.length === 0) {
    fileListElement.innerHTML = '<li class="empty-list">No files selected</li>';
    mergeButton.disabled = true;
    
    // Update counter
    document.getElementById('file-counter').textContent = '0 files selected';
    return;
  }
  
  selectedFiles.forEach((file, index) => {
    const li = document.createElement('li');
    li.setAttribute('data-index', index);
    
    li.innerHTML = `
      <div class="file-info">
        <span class="file-icon">📄</span>
        <span class="file-name">${file.name}</span>
      </div>
      <span class="file-size">${formatFileSize(file.size)}</span>
      <button class="delete-file" title="Remove file" aria-label="Remove ${file.name}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    // Add the selected class if this was the previously selected item
    if (selectedFileItem && parseInt(selectedFileItem.getAttribute('data-index')) === index) {
      li.classList.add('selected');
      selectedFileItem = li;
    }
    
    // Add event listener for file selection
    li.addEventListener('click', handleFileItemSelection);
    
    // Add event listener for delete button
    const deleteBtn = li.querySelector('.delete-file');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Stop event from bubbling to parent li
        deleteFile(index);
      });
    }
    
    fileListElement.appendChild(li);
  });
  
  // Enable merge button if we have files
  mergeButton.disabled = selectedFiles.length < 1;
  
  // Update counter with proper pluralization
  const fileText = selectedFiles.length === 1 ? 'file' : 'files';
  document.getElementById('file-counter').textContent = `${selectedFiles.length} ${fileText} selected`;
}

/**
 * Delete a single file from the list
 */
function deleteFile(index) {
  // Remove from the array
  selectedFiles.splice(index, 1);
  
  // If we removed the selected file, clear selection
  if (selectedFileItem && parseInt(selectedFileItem.getAttribute('data-index')) === index) {
    selectedFileItem = null;
  }
  
  // Update the file list display
  updateFileList();
  
  // If all files were deleted, reset the file input
  if (selectedFiles.length === 0) {
    resetFileInput();
  }
}

/**
 * Move the selected file up in the list
 */
function moveFileUp() {
  if (!selectedFileItem) return;
  
  const index = parseInt(selectedFileItem.getAttribute('data-index'));
  if (index <= 0) return; // Already at the top
  
  // Swap the files in the array
  [selectedFiles[index], selectedFiles[index - 1]] = [selectedFiles[index - 1], selectedFiles[index]];
  
  // Update the file list
  updateFileList();
  
  // Re-select the moved file with its new index
  const newSelectedItem = document.querySelector(`[data-index="${index - 1}"]`);
  if (newSelectedItem) {
    newSelectedItem.click();
  }
}

/**
 * Move the selected file down in the list
 */
function moveFileDown() {
  if (!selectedFileItem) return;
  
  const index = parseInt(selectedFileItem.getAttribute('data-index'));
  if (index >= selectedFiles.length - 1) return; // Already at the bottom
  
  // Swap the files in the array
  [selectedFiles[index], selectedFiles[index + 1]] = [selectedFiles[index + 1], selectedFiles[index]];
  
  // Update the file list
  updateFileList();
  
  // Re-select the moved file with its new index
  const newSelectedItem = document.querySelector(`[data-index="${index + 1}"]`);
  if (newSelectedItem) {
    newSelectedItem.click();
  }
}

/**
 * Set up the move button event listeners
 */
function setupMoveButtons() {
  const moveUpBtn = document.getElementById('move-up');
  const moveDownBtn = document.getElementById('move-down');
  
  if (moveUpBtn) {
    moveUpBtn.addEventListener('click', moveFileUp);
  }
  
  if (moveDownBtn) {
    moveDownBtn.addEventListener('click', moveFileDown);
  }
}

/**
 * Main application logic
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  fileListElement = document.getElementById('file-list');
  mergeButton = document.getElementById('merge-button');
  const downloadLink = document.getElementById('download-link');
  const resultsSection = document.getElementById('results-section');
  const loadingOverlay = document.getElementById('loading-overlay');
  const fileSizeElement = document.getElementById('file-size');
  const clearFilesButton = document.getElementById('clear-files');
  const startOverButton = document.getElementById('start-over');
  const privacyLink = document.getElementById('privacy-link');
  const privacyModal = document.getElementById('privacy-modal');
  const closeModal = document.querySelector('.close-modal');
  
  // Show/hide loading overlay
  const showLoading = () => {
    loadingOverlay.classList.remove('hidden');
  };
  
  const hideLoading = () => {
    loadingOverlay.classList.add('hidden');
  };
  
  /**
   * Handle file selection for reordering
   */
  function handleFileSelection(e) {
    // Remove selection from previously selected item
    const previousSelection = document.querySelector('#file-list li.selected');
    if (previousSelection) {
      previousSelection.classList.remove('selected');
    }
    
    // Set new selected item
    selectedFileItem = e.currentTarget;
    selectedFileItem.classList.add('selected');
    
    // Update button states
    updateMoveButtonStates();
  }
  
  /**
   * Process and add files to the list
   */
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
  
  // Use a single handler function for file input changes
  function handleFileInputChange(e) {
    handleFileSelection(e.target.files);
  }
  
  // Attach the file input event listener only once
  if (fileInput) {
    // Remove existing listeners to prevent duplicates
    fileInput.addEventListener('change', handleFiles);
  }
  
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
    if (e.target.closest('.file-input-label')) {
      return;
    }
    fileInput.click();
  });
  
  // Merge button handler
  mergeButton.addEventListener('click', async function() {
    if (selectedFiles.length === 0) {
      alert('Please select at least one PDF file to merge.');
      return;
    }
    
    try {
      showLoading();
      
      console.log(`Merging ${selectedFiles.length} files in current UI order`);
      
      // Reset previous PDF preview if any
      document.getElementById('pdf-preview').innerHTML = `
        <div class="no-preview-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <p>Processing...</p>
        </div>
      `;
      
      // Merge PDFs using our ordered selectedFiles array
      const mergedPdfBytes = await pdfMerger.mergePDFs(selectedFiles);
      
      // Create download link
      const pdfUrl = pdfMerger.createDownloadLink(mergedPdfBytes);
      const downloadLink = document.getElementById('download-link');
      downloadLink.href = pdfUrl;
      downloadLink.download = selectedFiles.length > 1 ? 'merged.pdf' : selectedFiles[0].name;
      downloadLink.classList.remove('disabled'); // Enable the download link
      
      // Create preview
      await pdfMerger.createPDFPreview(mergedPdfBytes, 'pdf-preview');
      
      // Update file size
      const fileSizeBytes = mergedPdfBytes.length;
      document.getElementById('file-size').textContent = fileUtils.formatFileSize(fileSizeBytes);
      
      // Activate the results section
      const resultsSection = document.getElementById('results-section');
      resultsSection.classList.add('active');
      resultsSection.classList.remove('initially-inactive');
      
    } catch (error) {
      console.error('Error in merge process:', error);
      alert('Failed to merge PDFs: ' + error.message);
    } finally {
      hideLoading();
    }
  });
  
  // Clear files button
  document.getElementById('clear-files-main').addEventListener('click', function() {
    clearFiles();
    resetPdfPreview(); // Make sure this function is defined to reset the PDF preview
  });
  
  // Privacy modal handlers
  if (privacyLink && privacyModal) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.remove('hidden');
    });
    
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        privacyModal.classList.add('hidden');
      });
    }
    
    window.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        privacyModal.classList.add('hidden');
      }
    });
  }
  
  // Initialize file list
  updateFileList();
  
  // Set up move buttons (up/down)
  setupMoveButtons();
});