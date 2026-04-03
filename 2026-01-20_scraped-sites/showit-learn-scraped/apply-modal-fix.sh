#!/bin/bash

# Modal Image Fix - Automated Application Script
# This script adds the modal image fix to all HTML files in the scraped directory

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML_DIR="$SCRIPT_DIR/learn.showit.com"
BACKUP_DIR="$SCRIPT_DIR/learn.showit.com.backup.$(date +%Y%m%d_%H%M%S)"

echo "========================================"
echo "Modal Image Fix - Automated Installation"
echo "========================================"
echo ""

# Check if HTML directory exists
if [ ! -d "$HTML_DIR" ]; then
    echo "❌ Error: HTML directory not found at $HTML_DIR"
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
cp -r "$HTML_DIR" "$BACKUP_DIR"
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Count HTML files
HTML_COUNT=$(find "$HTML_DIR" -name "*.html" -type f | wc -l | tr -d ' ')
echo "📄 Found $HTML_COUNT HTML files to process"
echo ""

# Function to calculate relative path depth
get_relative_path() {
    local file_path="$1"
    local base_dir="$SCRIPT_DIR"
    local depth=0
    
    # Calculate how many directories deep the file is from script dir
    local rel_path="${file_path#$HTML_DIR/}"
    depth=$(echo "$rel_path" | grep -o "/" | wc -l | tr -d ' ')
    
    # Build relative path (../ for each level + 1 to get out of learn.showit.com)
    local path_prefix=""
    for ((i=0; i<=depth; i++)); do
        path_prefix="../$path_prefix"
    done
    
    echo "$path_prefix"
}

# Process each HTML file
PROCESSED=0
FAILED=0

echo "🔧 Processing HTML files..."

while IFS= read -r html_file; do
    # Calculate relative path to the fix files
    rel_path=$(get_relative_path "$html_file")
    
    # Check if file already has the fix
    if grep -q "modal-image-fix.js" "$html_file"; then
        echo "⏭️  Skipping (already fixed): $(basename "$html_file")"
        continue
    fi
    
    # Create temporary file
    temp_file="${html_file}.tmp"
    
    # Add the fix before </head> tag
    if sed "/<\/head>/i\\
<link rel=\"stylesheet\" href=\"${rel_path}modal-image-fix.css\">\\
<script src=\"${rel_path}modal-image-fix.js\" defer></script>" "$html_file" > "$temp_file"; then
        mv "$temp_file" "$html_file"
        ((PROCESSED++))
        
        # Show progress every 50 files
        if ((PROCESSED % 50 == 0)); then
            echo "✅ Processed $PROCESSED/$HTML_COUNT files..."
        fi
    else
        echo "❌ Failed to process: $html_file"
        ((FAILED++))
        rm -f "$temp_file"
    fi
done < <(find "$HTML_DIR" -name "*.html" -type f)

echo ""
echo "========================================"
echo "✨ Installation Complete!"
echo "========================================"
echo "📊 Summary:"
echo "   - Total files found: $HTML_COUNT"
echo "   - Successfully processed: $PROCESSED"
echo "   - Failed: $FAILED"
echo "   - Backup location: $BACKUP_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All files processed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open any HTML file in a browser"
    echo "   2. Test opening a modal/pop-up with an image"
    echo "   3. Verify the image appears immediately"
    echo ""
    echo "⚠️  To rollback, run: rm -rf '$HTML_DIR' && mv '$BACKUP_DIR' '$HTML_DIR'"
else
    echo "⚠️  Some files failed to process. Check the output above for details."
fi

echo ""
