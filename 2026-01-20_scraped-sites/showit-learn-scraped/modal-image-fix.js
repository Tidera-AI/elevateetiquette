/**
 * Modal Image Fix
 * 
 * This script fixes the issue where images don't appear in pop-ups/modals
 * until the browser window is resized. This is a common problem caused by
 * the browser not properly calculating image dimensions on initial render.
 */

(function() {
    'use strict';

    /**
     * Force image reflow - triggers the browser to recalculate dimensions
     */
    function forceImageReflow(img) {
        if (!img) return;
        
        // Method 1: Force a reflow by reading offsetHeight
        void img.offsetHeight;
        
        // Method 2: Temporarily change display property
        const originalDisplay = img.style.display;
        img.style.display = 'none';
        void img.offsetHeight; // Force reflow
        img.style.display = originalDisplay;
    }

    /**
     * Fix all images in a container (like a modal)
     */
    function fixImagesInContainer(container) {
        if (!container) return;
        
        const images = container.querySelectorAll('img');
        
        images.forEach(function(img) {
            // If image is already loaded
            if (img.complete && img.naturalHeight !== 0) {
                forceImageReflow(img);
            } else {
                // Wait for image to load
                img.addEventListener('load', function() {
                    forceImageReflow(img);
                }, { once: true });
            }
        });
        
        // Also force container reflow
        void container.offsetHeight;
    }

    /**
     * Setup MutationObserver to detect when modals are added to DOM
     */
    function setupModalObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node is or contains a modal
                        const modalSelectors = [
                            '[role="dialog"]',
                            '[role="alertdialog"]',
                            '.modal',
                            '.popup',
                            '.lightbox',
                            '.overlay',
                            '[aria-modal="true"]',
                            '[data-modal]',
                            '[data-popup]'
                        ];
                        
                        modalSelectors.forEach(function(selector) {
                            // Check if node itself is a modal
                            if (node.matches && node.matches(selector)) {
                                setTimeout(function() {
                                    fixImagesInContainer(node);
                                }, 50); // Small delay to ensure DOM is ready
                            }
                            
                            // Check for modals inside the node
                            const modals = node.querySelectorAll(selector);
                            modals.forEach(function(modal) {
                                setTimeout(function() {
                                    fixImagesInContainer(modal);
                                }, 50);
                            });
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Handle existing modals that are shown via CSS display changes
     */
    function setupDisplayChangeDetection() {
        // Watch for elements that change from display:none to visible
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const element = mutation.target;
                    const style = window.getComputedStyle(element);
                    
                    // If element became visible and contains images
                    if (style.display !== 'none' && element.querySelector('img')) {
                        fixImagesInContainer(element);
                    }
                }
            });
        });
        
        // Observe all potential modal containers
        document.addEventListener('DOMContentLoaded', function() {
            const potentialModals = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="dialog"], [class*="overlay"]');
            
            potentialModals.forEach(function(modal) {
                observer.observe(modal, {
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            });
        });
    }

    /**
     * Handle clicks that might open modals
     */
    function setupClickHandlers() {
        document.addEventListener('click', function(e) {
            // Find buttons/links that might open modals
            const target = e.target.closest('[data-toggle], [data-target], button, a');
            
            if (target) {
                // Wait for potential modal to open
                setTimeout(function() {
                    const modals = document.querySelectorAll('[role="dialog"]:not([style*="display: none"]), .modal:not([style*="display: none"])');
                    
                    modals.forEach(function(modal) {
                        fixImagesInContainer(modal);
                    });
                }, 100);
            }
        }, true);
    }

    /**
     * Fix for CSS class-based visibility changes
     */
    function setupClassChangeDetection() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const element = mutation.target;
                    const classList = element.classList;
                    
                    // Common class names that indicate a modal is visible
                    const visibilityClasses = ['show', 'active', 'open', 'visible', 'is-visible', 'is-open'];
                    const hasVisibilityClass = visibilityClasses.some(function(cls) {
                        return classList.contains(cls);
                    });
                    
                    if (hasVisibilityClass && element.querySelector('img')) {
                        fixImagesInContainer(element);
                    }
                }
            });
        });
        
        document.addEventListener('DOMContentLoaded', function() {
            const potentialModals = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="dialog"]');
            
            potentialModals.forEach(function(modal) {
                observer.observe(modal, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            });
        });
    }

    /**
     * Initialize all fixes
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setupModalObserver();
                setupDisplayChangeDetection();
                setupClickHandlers();
                setupClassChangeDetection();
            });
        } else {
            setupModalObserver();
            setupDisplayChangeDetection();
            setupClickHandlers();
            setupClassChangeDetection();
        }
    }

    // Start the fix
    init();
})();
