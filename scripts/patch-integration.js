const fs = require('fs');
const path = require('path');

// Fix wardrobe-page.tsx - add toolbar and dialog before </AppLayout>
function patchWardrobePage() {
    const filePath = path.join(__dirname, '../../client/src/pages/wardrobe-page.tsx');
    let content = fs.readFileSync(filePath, 'utf8');

    const toolbarCode = `
            {/* Multi-Select Toolbar - FULLY FUNCTIONAL */}
            <MultiSelectToolbar
                selectedCount={multiSelect.selectedCount}
                onAddToOutfit={() => setShowOutfitDialog(true)}
                onMarkFavorites={multiSelect.handleBatchFavorites}
                onDelete={multiSelect.handleBatchDelete}
                onCancel={multiSelect.clearSelection}
            />

            {/* Outfit Selection Dialog */}
            <OutfitSelectionDialog
                isOpen={showOutfitDialog}
                onClose={() => setShowOutfitDialog(false)}
                onSelect={multiSelect.handleAddToOutfit}
                selectedCount={multiSelect.selectedCount}
            />

`;

    // Add before </AppLayout>
    if (!content.includes('MultiSelectToolbar')) {
        content = content.replace('        </AppLayout >', toolbarCode + '        </AppLayout >');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✓ Patched wardrobe-page.tsx');
    } else {
        console.log('✓ wardrobe-page.tsx already patched');
    }
}

// Fix app-layout.tsx - add search dialog import and render
function patchAppLayout() {
    const filePath = path.join(__dirname, '../../client/src/components/layout/app-layout.tsx');
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import
    if (!content.includes('SearchDialog')) {
        content = content.replace(
            'import { useAuth } from "@/hooks/use-auth";',
            'import { useAuth } from "@/hooks/use-auth";\nimport { SearchDialog } from "@/components/ui/search-dialog";'
        );
    }

    // Add onClick to search button (line ~113)
    content = content.replace(
        '<button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1A1A1A]">\n                            <Search className="w-4 h-4" />',
        '<button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1A1A1A]">\n                            <Search className="w-4 h-4" />'
    );

    // Add dialog before closing </div>
    if (!content.includes('<SearchDialog')) {
        content = content.replace(
            '            </main>\n\n        </div>',
            '            </main>\n\n            {/* Global Search Dialog */}\n            <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />\n\n        </div>'
        );
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ Patched app-layout.tsx');
}

try {
    patchWardrobePage();
    patchAppLayout();
    console.log('\n✅ All patches applied successfully!');
    console.log('Run: npm run dev');
} catch (error) {
    console.error('❌ Error applying patches:', error.message);
    process.exit(1);
}
