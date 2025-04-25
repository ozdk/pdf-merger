import * as FileUtils from '../utils/file-utils.js';

/**
 * Handles UI updates and interactions
 */
class UIController {
  constructor() {
    // DOM Elements
    this.dropZone = document.getElementById('drop-zone');
    this.fileInput = document.getElementById('file-input');
    this.fileListElement = document.getElementById('file-list');
    this.mergeButton = document.getElementById('merge-button');
    this.fileCounter = document.getElementById('file-counter');
    this.moveUpBtn = document.getElementById('move-up');
    this.moveDownBtn = document.getElementById('move-down');
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.fileCounterLabel = document.querySelector('.file-counter-label');
    
    // Update the file counter label text
    if (this.fileCounterLabel) {
      this.fileCounterLabel.textContent = 'Files order determines order in merged PDF';
    }
    
    // Remove the "Change Order" text
    const reorderTitle = document.querySelector('.reorder-title');
    if (reorderTitle) {
      reorderTitle.innerHTML = '';
    }
    
    this.selectedFileItem = null;
  }
  
  updateFileList(files) {
    if (!this.fileListElement) return;
    
    this.fileListElement.innerHTML = '';
    
    if (files.length === 0) {
      this.fileListElement.innerHTML = '<li class="empty-list">No files selected</li>';
      this.mergeButton.disabled = true;
      this.fileCounter.textContent = '0 files selected';
      return;
    }
    
    files.forEach((file, index) => {
      const li = document.createElement('li');
      li.setAttribute('data-index', index);
      
      // Include the order number in the displayed file item
      li.innerHTML = `
        <div class="file-info">
          <span class="file-number">${index + 1}</span>
          <span class="file-icon">📄</span>
          <span class="file-name">${file.name}</span>
        </div>
        <span class="file-size">${FileUtils.formatFileSize(file.size)}</span>
        <button class="delete-file" title="Remove file" aria-label="Remove ${file.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      // Add the selected class if this was the previously selected item
      if (this.selectedFileItem && parseInt(this.selectedFileItem.getAttribute('data-index')) === index) {
        li.classList.add('selected');
        this.selectedFileItem = li;
      }
      
      this.fileListElement.appendChild(li);
    });
    
    // Enable merge button if we have files
    this.mergeButton.disabled = files.length < 1;
    
    // Update counter with proper pluralization
    const fileText = files.length === 1 ? 'file' : 'files';
    this.fileCounter.textContent = `${files.length} ${fileText} selected`;
    
    // Update button states
    this.updateMoveButtonStates();
  }
  
  updateMoveButtonStates() {
    if (!this.moveUpBtn || !this.moveDownBtn) return;
    
    // If no selection or no files, disable both buttons
    if (!this.selectedFileItem || this.fileListElement.children.length <= 1) {
      this.moveUpBtn.disabled = true;
      this.moveDownBtn.disabled = true;
      return;
    }
    
    const fileItems = Array.from(this.fileListElement.children);
    const selectedIndex = fileItems.indexOf(this.selectedFileItem);
    
    // If invalid selection, disable both
    if (selectedIndex === -1) {
      this.moveUpBtn.disabled = true;
      this.moveDownBtn.disabled = true;
      return;
    }
    
    // Update button states based on position
    this.moveUpBtn.disabled = selectedIndex === 0;
    this.moveDownBtn.disabled = selectedIndex === fileItems.length - 1;
  }
  
  selectFileItem(index) {
    // Find the file item by index and select it
    const itemToSelect = document.querySelector(`[data-index="${index}"]`);
    if (itemToSelect) {
      if (this.selectedFileItem) {
        this.selectedFileItem.classList.remove('selected');
      }
      
      this.selectedFileItem = itemToSelect;
      this.selectedFileItem.classList.add('selected');
      
      // Ensure the item is visible by scrolling to it if needed
      itemToSelect.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      this.updateMoveButtonStates();
    }
  }
  
  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
  }
  
  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
  }
  
  resetPdfPreview() {
    const previewElement = document.getElementById('pdf-preview');
    if (previewElement) {
      previewElement.innerHTML = `
        <div class="no-preview-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <p>Merged PDF will be displayed here</p>
        </div>
      `;
    }
    
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.classList.remove('active');
      resultsSection.classList.add('initially-inactive');
    }
    
    // Reset download link
    const downloadLink = document.getElementById('download-link');
    if (downloadLink) {
      downloadLink.classList.add('disabled');
      downloadLink.removeAttribute('href');
    }
    
    // Hide file size info
    const fileInfo = document.getElementById('file-info');
    if (fileInfo) {
      fileInfo.classList.add('hidden');
    }
  }
}

export default UIController;