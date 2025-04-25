import Config from './config.js';
import * as FileUtils from './utils/file-utils.js';
import FileManager from './modules/file-manager.js';
import UIController from './modules/ui-controller.js';
import PDFMerger from './modules/pdf-merger.js';
import ModalHandler from './modules/modal-handler.js';

/**
 * PDF Merger Application
 * Main entry point
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  const uiController = new UIController();
  const fileManager = new FileManager(uiController);
  const pdfMerger = new PDFMerger();
  const modalHandler = new ModalHandler();
  
  // DOM Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const mergeButton = document.getElementById('merge-button');
  const clearFilesButton = document.getElementById('clear-files-main');
  const downloadLink = document.getElementById('download-link');
  
  // Set up event handlers for drag and drop
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
    fileManager.addFiles(e.dataTransfer.files);
    updateMergeButtonState();
  });
  
  dropZone.addEventListener('click', (e) => {
    if (e.target.closest('.file-input-label')) {
      return;
    }
    fileInput.click();
  });
  
  // File input change handler
  fileInput.addEventListener('change', (e) => {
    fileManager.addFiles(e.target.files);
    updateMergeButtonState();
  });
  
  // File list event delegation
  uiController.fileListElement.addEventListener('click', (e) => {
    // Handle file selection
    if (e.target.closest('li') && !e.target.closest('.delete-file')) {
      const target = e.target.closest('li');
      
      // Remove selected class from any currently selected item
      if (uiController.selectedFileItem) {
        uiController.selectedFileItem.classList.remove('selected');
      }
      
      // Always select the clicked item rather than toggling
      uiController.selectedFileItem = target;
      target.classList.add('selected');
      
      fileManager.setSelectedFileItem(uiController.selectedFileItem);
      uiController.updateMoveButtonStates();
    }
    
    // Handle delete button click
    if (e.target.closest('.delete-file')) {
      const index = parseInt(e.target.closest('li').getAttribute('data-index'));
      fileManager.deleteFile(index);
      updateMergeButtonState();
    }
  });
  
  // Move buttons
  document.getElementById('move-up').addEventListener('click', () => {
    fileManager.moveFileUp();
  });
  
  document.getElementById('move-down').addEventListener('click', () => {
    fileManager.moveFileDown();
  });
  
  // Merge button handler
  mergeButton.addEventListener('click', async () => {
    if (!fileManager.hasFiles()) {
      alert('Please select at least one PDF file to merge.');
      return;
    }
    
    try {
      uiController.showLoading();
      uiController.resetPdfPreview();
      
      // Process the PDFs
      const mergedPdfBytes = await pdfMerger.mergePDFs(fileManager.getFiles());
      
      // Create download link
      const pdfUrl = pdfMerger.createDownloadLink(mergedPdfBytes);
      downloadLink.href = pdfUrl;
      downloadLink.download = fileManager.getFiles().length > 1 
        ? Config.defaultMergedFilename 
        : fileManager.getFiles()[0].name;
      downloadLink.classList.remove('disabled');
      
      // Create preview
      await pdfMerger.createPDFPreview(mergedPdfBytes, 'pdf-preview');
      
      // File size display removed as per requirements
      
      // Show results section
      const resultsSection = document.getElementById('results-section');
      resultsSection.classList.add('active');
      resultsSection.classList.remove('initially-inactive');
      
    } catch (error) {
      console.error('Error in merge process:', error);
      alert('Failed to merge PDFs: ' + error.message);
    } finally {
      uiController.hideLoading();
    }
  });
  
  // Clear files button
  clearFilesButton.addEventListener('click', () => {
    fileManager.clearFiles();
    uiController.resetPdfPreview();
    updateMergeButtonState();
  });
});

/**
 * Updates the merge button state based on number of uploaded files
 */
function updateMergeButtonState() {
  const fileList = document.getElementById('file-list');
  const mergeButton = document.getElementById('merge-button');
  
  // Only enable the merge button if 2 or more files are uploaded
  if (fileList.children.length >= 2) {
    mergeButton.disabled = false;
    mergeButton.setAttribute('aria-disabled', 'false');
  } else {
    mergeButton.disabled = true;
    mergeButton.setAttribute('aria-disabled', 'true');
  }
}