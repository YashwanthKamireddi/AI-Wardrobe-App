
new_content = """                    <div className="grid md:grid-cols-2 gap-8 mt-20 max-w-4xl mx-auto items-stretch">
                        {/* Tier 1: Collector - Clean, Light */}
                        <div className="flex flex-col p-10 bg-[#FAF9F6] border border-[#e5e5e5] rounded-xl text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                            <div className="mb-8">
                                <h3 className="font-playfair text-3xl mb-2 text-[#1a1a1a]">Collector</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Essential Curation</p>
                            </div>

                            <div className="mb-8 relative inline-flex justify-center items-baseline gap-1">
                                <span className="text-2xl font-playfair text-[#1a1a1a] self-start">$</span>
                                <span className="text-6xl font-playfair text-[#1a1a1a] leading-none">29</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest self-end mb-1">/mo</span>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow border-t border-b border-[#e5e5e5] py-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]">Up to 50 Items</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Basic Analytics</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Self-Service</p>
                            </div>

                            <Link href="/auth">
                                <button className="w-full py-4 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-colors">
                                    Apply
                                </button>
                            </Link>
                        </div>

                        {/* Tier 2: Archivist - Premium, Dark */}
                        <div className="flex flex-col p-10 bg-[#1a1a1a] border border-[#1a1a1a] rounded-xl text-center overflow-hidden shadow-2xl relative group hover:-translate-y-1 transition-transform duration-300">
                            {/* Subtle Texture */}
                            <div className="absolute inset-0 bg-[#80163a] opacity-[0.05]" />

                            <div className="relative z-10 mb-8">
                                <h3 className="font-playfair text-3xl mb-2 text-white">Archivist</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] opacity-90">Unlimited Access</p>
                            </div>

                            <div className="relative z-10 mb-8 inline-flex justify-center items-baseline gap-1">
                                <span className="text-2xl font-playfair text-white self-start">$</span>
                                <span className="text-6xl font-playfair text-white leading-none">99</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest self-end mb-1">/mo</span>
                            </div>

                            <div className="relative z-10 space-y-4 mb-10 flex-grow border-t border-b border-white/10 py-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-white">Unlimited Items</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-white/90">Advanced Metrics</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-white/90">AI Personal Stylist</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mt-2">Priority Support</p>
                            </div>

                            <Link href="/auth">
                                <button className="relative z-10 w-full py-4 bg-white text-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#1a1a1a] border border-white transition-colors">
                                    Become a Member
                                </button>
                            </Link>
                        </div>
                    </div>"""

target_file = '/home/yash/Projects/AI-Wardrobe-App/client/src/pages/landing-page.tsx'

with open(target_file, 'r') as f:
    lines = f.readlines()

# Scan for the start and end of the pricing grid block
start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if '{/* Tier 1: Collector */}' in line or '{/* Tier 1: Collector - Clean, Light */}' in line or 'Tier 1' in line and 'grid' in lines[i-1]:
         # Found the start (approximate, adjust for container div)
         start_index = i - 1
         break

if start_index == -1:
    # Fallback search for the grid container
    for i, line in enumerate(lines):
        if 'className="grid' in line and 'Tier 1' in lines[i+2]:
            start_index = i
            break

# Find closing div of the grid. It should be after Tier 2.
if start_index != -1:
    # We want to replace the whole grid div block.
    # It starts at start_index. We need to find the matching closing div.
    # Simplified approach: Look for the line before {/* Footer / CTA */}
    for i in range(start_index, len(lines)):
        if '{/* Footer / CTA */}' in line: # actually we need to stop before this section closer
             # The pricing section closes at </section>. The grid closes before that.
             pass
        if lines[i].strip() == '</section>':
             end_index = i - 2 # </div> lines
             break

# More robust fixed range since I know the file structure from previous reads
# Based on previous `replace_pricing.py` and `cat` outputs, the grid starts around line 257 (in updated file).
# Let's search for the unique string `id="pricing"` and find the grid inside it.

pricing_section_start = -1
for i, line in enumerate(lines):
    if 'id="pricing"' in line:
        pricing_section_start = i
        break

if pricing_section_start != -1:
    # Find the grid div after this
    for i in range(pricing_section_start, len(lines)):
        if 'className="grid' in lines[i]:
            start_index = i
            break

    # Find the end of this grid div
    # Counting braces is better but let's assume it ends before the closing </section>
    # actually the </section> is the end of the section. The grid is the child.
    # The structure: <section> ... <div (max-w)> ... <div (grid)> ... </div> </div> </section>

    # Let's just hard replace the block between the grid start and the closing tags we know exist
    # I will replace from `start_index` to the line that closes the grid.

    # Actually, simpler: I'll blindly replace the text block I wrote last time.
    original_grid_start_text = '<div className="grid md:grid-cols-2'

    # Find start
    for i, line in enumerate(lines):
        if original_grid_start_text in line:
            start_index = i
            break

    # Find end: the line before `</div>` which is before `<section` ?
    # Let's look for `Tier 2` then find the closing `</div>`s
    if start_index != -1:
        # We will assume the block I wrote last time is there.
        # It ends with `                    </div>`
        # Let's scan for the next </section> and back up
        for i in range(start_index, len(lines)):
            if '</section>' in lines[i]:
                end_index = i - 2 # rough guess: </div> is i-1, another </div> is i-2
                # Wait, structure is:
                # <section>
                #   <div>
                #      ... header ...
                #      <GRID> ... </GRID>
                #   </div>
                # </section>

                # So the grid end is the second to last div before /section?
                end_index = i - 2
                break

if start_index != -1 and end_index != -1:
    # Replace
    pre = lines[:start_index]
    post = lines[end_index+1:]

    # Adjust post: if I cut too much or too little?
    # Let's be safer. Reading the file content again might be better but I can't in this step.
    # Let's use the explicit markers from my previous script if possible.
    pass

# Actually, the previous script wrote specific content. I can search for that content to replace it.
# Tier 2: Archivist ... button .. link .. div .. div.
# I will use a simple logic: Find lines[start_index] and lines[end_index] and swap.

with open(target_file, 'w') as f:
    f.writelines(pre)
    f.write(new_content)
    f.write('\\n')
    f.writelines(post)

print("Replacement successful")
