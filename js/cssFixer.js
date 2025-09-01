/**
 * CSS Link Fixer
 * Automatically fixes CSS links across all tools
 */
class CSSLinkFixer {
    constructor() {
        this.tools = [
            { 
                id: 'pdf-toolkit', 
                path: 'pdf-toolkit/index.html', 
                requiredCSS: [
                    { href: '../global.css', position: 'head' },
                    { href: '../responsive.css', position: 'head' },
                    { href: 'styles.css', position: 'head' }
                ]
            },
            { 
                id: 'word-counter', 
                path: 'word-counter/index.html', 
                requiredCSS: [
                    { href: '../global.css', position: 'head' },
                    { href: '../responsive.css', position: 'head' },
                    { href: 'styles.css', position: 'head' }
                ]
            },
            { 
                id: 'zip-extractor', 
                path: 'zip-extractor/index.html', 
                requiredCSS: [
                    { href: '../global.css', position: 'head' },
                    { href: '../responsive.css', position: 'head' },
                    { href: 'styles.css', position: 'head' }
                ]
            },
            { 
                id: 'qr-generator', 
                path: 'qr-generator/index.html', 
                requiredCSS: [
                    { href: '../global.css', position: 'head' },
                    { href: '../responsive.css', position: 'head' },
                    { href: 'qr-generator.css', position: 'head' }
                ]
            }
        ];
    }

    async fixCSSLinks() {
        const results = [];

        for (const tool of this.tools) {
            const toolResult = {
                id: tool.id,
                path: tool.path,
                cssFixed: false,
                changes: []
            };

            try {
                // Fetch the HTML file
                const response = await fetch(tool.path);
                let htmlContent = await response.text();

                // Check and add required CSS links
                for (const cssLink of tool.requiredCSS) {
                    // Check if link already exists
                    if (!htmlContent.includes(`href="${cssLink.href}"`)) {
                        // Prepare link tag
                        const linkTag = `\n  <link rel="stylesheet" href="${cssLink.href}">`;

                        // Insert link tag in the head
                        if (cssLink.position === 'head') {
                            htmlContent = htmlContent.replace(
                                /<\/head>/i, 
                                `${linkTag}\n</head>`
                            );
                        }

                        toolResult.cssFixed = true;
                        toolResult.changes.push(`Added CSS link: ${cssLink.href}`);
                    }
                }

                // If changes were made, write back to the file
                if (toolResult.cssFixed) {
                    await this.writeFile(tool.path, htmlContent);
                }

                results.push(toolResult);
            } catch (error) {
                toolResult.changes.push(`Error: ${error.message}`);
                results.push(toolResult);
            }
        }

        return results;
    }

    async writeFile(path, content) {
        try {
            const response = await fetch('/mcp_filesystem_write_file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path, content })
            });

            if (!response.ok) {
                throw new Error('Failed to write file');
            }
        } catch (error) {
            console.error(`Error writing file ${path}:`, error);
        }
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('css-fixer-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = results.map(result => `
            <div class="css-fixer-result ${result.cssFixed ? 'success' : 'error'}">
                <h3>${result.id}</h3>
                <p>Path: ${result.path}</p>
                <p>CSS Links Fixed: ${result.cssFixed ? '✅ Fixed' : '❌ No Changes'}</p>
                ${result.changes.length > 0 ? `
                    <p>Changes: 
                        <ul>
                            ${result.changes.map(change => `<li>${change}</li>`).join('')}
                        </ul>
                    </p>
                ` : ''}
            </div>
        `).join('');

        // Update overall fixer status
        const fixerStatus = document.getElementById('css-fixer-overall-status');
        if (fixerStatus) {
            const allFixed = results.every(result => result.cssFixed);
            fixerStatus.textContent = allFixed ? 'All CSS Links Fixed ✅' : 'Some CSS Links Need Attention ⚠️';
            fixerStatus.className = allFixed ? 'status-success' : 'status-warning';
        }
    }

    async runFixer() {
        const results = await this.fixCSSLinks();
        this.displayResults(results);
    }
}

// Run fixer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const fixer = new CSSLinkFixer();
    fixer.runFixer();
});