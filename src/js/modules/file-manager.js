import * as FileUtils from '../utils/file-utils.js';

/**
 * Manages selected files and their ordering
 */
class FileManager {
  constructor(uiController) {
    this.selectedFiles = [];
    this.selectedFileItem = null;
    this.uiController = uiController;
  }
  
  addFiles(files) {
    const validFiles = Array.from(files).filter(file => {
      // Check if it's a PDF
      if (!FileUtils.isValidPDF(file)) {
        alert(`"${file.name}" is not a valid PDF file.`);
        return false;
      }
      return true;
    });
    
    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    this.uiController.updateFileList(this.selectedFiles);
  }
  
  deleteFile(index) {
    // Store the selected index for proper re-selection after deletion
    const wasSelected = this.selectedFileItem && 
                       parseInt(this.selectedFileItem.getAttribute('data-index')) === index;
    const selectedIndex = wasSelected ? null : 
                         (this.selectedFileItem ? 
                          parseInt(this.selectedFileItem.getAttribute('data-index')) : null);
    
    // Remove the file from array
    this.selectedFiles.splice(index, 1);
    
    // Update UI
    this.uiController.updateFileList(this.selectedFiles);
    
    // Reselect appropriate item after deletion
    if (selectedIndex !== null) {
      // If the deleted item was before the selected item, adjust index
      if (index < selectedIndex) {
        this.uiController.selectFileItem(selectedIndex - 1);
      } else {
        this.uiController.selectFileItem(selectedIndex);
      }
    }
    
    if (this.selectedFiles.length === 0) {
      FileUtils.resetFileInput();
    }
  }
  
  clearFiles() {
    this.selectedFiles = [];
    this.selectedFileItem = null;
    FileUtils.resetFileInput();
    this.uiController.updateFileList(this.selectedFiles);
  }
  
  moveFileUp() {
    if (!this.selectedFileItem) return;
    
    const index = parseInt(this.selectedFileItem.getAttribute('data-index'));
    if (index <= 0) return; // Already at the top
    
    // Swap the files in the array
    [this.selectedFiles[index], this.selectedFiles[index - 1]] = 
    [this.selectedFiles[index - 1], this.selectedFiles[index]];
    
    // Update the file list
    this.uiController.updateFileList(this.selectedFiles);
    
    // Re-select the moved file with its new index
    setTimeout(() => {
      this.uiController.selectFileItem(index - 1);
      
      // This is the critical line that was missing - update the FileManager's reference
      this.selectedFileItem = document.querySelector(`[data-index="${index - 1}"]`);
    }, 50); // Increased timeout for more reliable DOM updates
  }
  
  moveFileDown() {
    if (!this.selectedFileItem) return;
    
    const index = parseInt(this.selectedFileItem.getAttribute('data-index'));
    if (index >= this.selectedFiles.length - 1) return; // Already at the bottom
    
    // Swap the files in the array
    [this.selectedFiles[index], this.selectedFiles[index + 1]] = 
    [this.selectedFiles[index + 1], this.selectedFiles[index]];
    
    // Update the file list
    this.uiController.updateFileList(this.selectedFiles);
    
    // Re-select the moved file with its new index
    setTimeout(() => {
      this.uiController.selectFileItem(index + 1);
      
      // This is the critical line that was missing - update the FileManager's reference
      this.selectedFileItem = document.querySelector(`[data-index="${index + 1}"]`);
    }, 50); // Increased timeout for more reliable DOM updates
  }
  
  setSelectedFileItem(element) {
    this.selectedFileItem = element;
  }
  
  getFiles() {
    return this.selectedFiles;
  }
  
  hasFiles() {
    return this.selectedFiles.length > 0;
  }
}

export default FileManager;