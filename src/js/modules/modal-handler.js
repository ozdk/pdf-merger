/**
 * Handles modal dialog functionality
 */
class ModalHandler {
  constructor() {
    this.privacyLink = document.getElementById('privacy-link');
    this.privacyModal = document.getElementById('privacy-modal');
    this.closeModalBtn = this.privacyModal ? this.privacyModal.querySelector('.close-modal') : null;
    
    this.init();
  }
  
  init() {
    // Handle privacy dialog interactions
    if (this.privacyLink && this.privacyModal) {
      // Open modal when clicking privacy link
      this.privacyLink.addEventListener('click', this.openModal.bind(this));
      
      // Close modal when clicking close button
      if (this.closeModalBtn) {
        this.closeModalBtn.addEventListener('click', this.closeModal.bind(this));
      }
      
      // Close modal when clicking backdrop
      this.privacyModal.addEventListener('click', (e) => {
        if (e.target === this.privacyModal) {
          this.closeModal();
        }
      });
      
      // Add escape key support
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.privacyModal.open) {
          this.closeModal();
        }
      });
    }
  }
  
  openModal(e) {
    if (e) e.preventDefault();
    
    if (typeof this.privacyModal.showModal === 'function') {
      this.privacyModal.showModal();
    } else {
      this.privacyModal.classList.add('fallback-modal');
      this.privacyModal.style.display = 'flex';
    }
  }
  
  closeModal() {
    if (typeof this.privacyModal.close === 'function') {
      this.privacyModal.close();
    } else {
      this.privacyModal.classList.remove('fallback-modal');
      this.privacyModal.style.display = 'none';
    }
  }
}

export default ModalHandler;