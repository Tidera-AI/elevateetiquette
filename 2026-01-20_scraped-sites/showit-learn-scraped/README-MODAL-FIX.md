# Modal Image Fix

## Problem
Images in pop-ups/modals don't appear until the browser window is resized. This is a common issue caused by the browser not properly calculating image dimensions when modals are initially opened.

## Solution
This fix provides both CSS and JavaScript solutions to ensure images appear correctly in modals from the start.

## Installation

### Option 1: Add to All HTML Files (Recommended)
Add these lines to the `<head>` section of your HTML files:

```html
<!-- Add to <head> section -->
<link rel="stylesheet" href="modal-image-fix.css">
<script src="modal-image-fix.js" defer></script>
```

### Option 2: Inline the Fixes
If you prefer not to use external files, you can inline the CSS and JavaScript directly into your HTML files.

#### For CSS:
Add inside the `<head>` section:

```html
<style>
  /* Copy contents of modal-image-fix.css here */
</style>
```

#### For JavaScript:
Add before the closing `</body>` tag:

```html
<script>
  // Copy contents of modal-image-fix.js here
</script>
```

## How It Works

### CSS Solution
The CSS file includes:
- Proper image sizing constraints (`max-width: 100%`, `height: auto`)
- GPU acceleration hints (`transform: translateZ(0)`)
- Animation-based repaint forcing for newly visible modals
- Fixes for flex/grid containers
- Lazy loading adjustments

### JavaScript Solution
The JavaScript file provides:
- **MutationObserver** to detect when modals are added to the DOM
- **Display change detection** for modals that are shown/hidden via CSS
- **Class change detection** for modals that use class-based visibility
- **Click handlers** to catch modal-opening events
- **Forced reflow** to ensure proper image dimension calculation

## Testing

After adding the fix, test by:
1. Opening your HTML file in a browser
2. Clicking on any element that opens a modal/pop-up with an image
3. Verifying that the image appears immediately without needing to resize the window

## Automated Installation Script

To automatically add the fix to all HTML files, you can use this bash command:

```bash
cd showit-learn-scraped

# Create backup first
cp -r learn.showit.com learn.showit.com.backup

# Add the fix to all HTML files
find learn.showit.com -name "*.html" -type f -exec sed -i '' '/<\/head>/i\
<link rel="stylesheet" href="../../../modal-image-fix.css">\
<script src="../../../modal-image-fix.js" defer></script>\
' {} \;
```

**Note:** Adjust the relative path (`../../../`) based on your file structure depth.

## Alternative Quick Fix

If you want a simpler solution that works in most cases, add this to your HTML files:

```html
<style>
  [role="dialog"] img, .modal img, .popup img {
    display: block;
    max-width: 100%;
    height: auto;
    transform: translateZ(0);
  }
</style>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Force reflow when modal becomes visible
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.matches && 
              (node.matches('[role="dialog"]') || node.matches('.modal'))) {
            node.querySelectorAll('img').forEach(function(img) {
              void img.offsetHeight; // Force reflow
            });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
</script>
```

## Troubleshooting

### Images still not appearing?
1. Check browser console for JavaScript errors
2. Verify the modal selector matches your modal's HTML structure
3. Try adding `!important` to CSS rules
4. Increase the timeout in JavaScript from 50ms to 100ms or 200ms

### Need custom modal selectors?
Edit the `modalSelectors` array in `modal-image-fix.js` to include your specific modal classes or attributes.

## Browser Compatibility
- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported  
- Safari: ✅ Fully supported
- Internet Explorer 11: ⚠️ Partial support (requires polyfill for MutationObserver)

## Files
- `modal-image-fix.js` - JavaScript solution
- `modal-image-fix.css` - CSS solution
- `README-MODAL-FIX.md` - This documentation

## Support
If the issue persists, the problem might be specific to your modal implementation. Common additional causes:
- Image lazy loading conflicts
- JavaScript framework (React, Vue, etc.) lifecycle issues
- CSS transitions delaying visibility
- Incorrect image URLs or paths
