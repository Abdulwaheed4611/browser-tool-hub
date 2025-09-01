/**
 * CSS Link Validator and Fixer
 * Comprehensive validation and correction of CSS links across all tools
 */
class CSSLinkValidator {
    constructor() {
        this.tools = [
            { 
                id: 'pdf-toolkit', 
                path: 'pdf-toolkit/index.html', 
                expectedCSS: ['styles.css', '../global.css', '../responsive.css'],
                fallbackCSS: ['pdf-toolkit.css']
            },
            { 
                id: 'word-counter', 
                path: 'word-counter/index.html', 
                expectedCSS: ['styles.css', '../global.css', '../responsive.css'],
                fallbackCSS: ['word-counter.css']
            },
            { 
                id: 'zip-extractor', 
                path: 'zip-extractor/index.html', 
                expectedCSS: ['styles.css', '../global.css', '../responsive.css'],
                fallbackCSS: ['zip-extractor.css']
            },
            { 
                id: 'qr-scanner', 
                path: 'qr-scanner/index.html', 
                expectedCSS: ['qr-scanner.css', '../global.css', '../responsive.css']
            },
            { 
                id: 'qr-generator', 
                path: 'qr-generator/index.html', 
                expectedCSS: ['qr-generator.css', '../global.css', '../responsive.css'],
                additionalCSS: ['styles.css']
            },
            { 
                id: 'image-editor', 
                path: 'image-editor/index.html', 
                expectedCSS: ['image-editor.css', '../global.css', '../responsive.css']
            },
            { 
                id: 'text-encryption', 
                path: 'text-encryption/index.html', 
                expectedCSS: ['text-encryption.css', '../global.css', '../responsive.css']
            }
        ];
    }

    async validateAndFixCSSLinks() {
        const results = [];

        for (const tool of this.tools) {
            const toolResult = {
                id: tool.id,
                path: tool.path,
                cssLinksFixed: false,
                missingLinks: [],
                extraLinks: [],
                errors: []
            };

            try {
                // Fetch the HTML file
                const response = await fetch(tool.path);
                const htmlContent = await response.text();

                // Create a temporary div to parse HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;

                // Find existing CSS links
                const existingCSSLinks = Array.from(tempDiv.querySelectorAll('link[rel="stylesheet"]'))
                    .map(link => link.getAttribute('href'));

                // Check for missing expected CSS links
                const missingLinks = tool.expectedCSS.filter(css => 
                    !existingCSSLinks.includes(css)
                );

                // Check for unexpected additional links
                const unexpectedLinks = existingCSSLinks.filter(link => 
                    !tool.expectedCSS.includes(link) && 
                    (!tool.additionalCSS || !tool.additionalCSS.includes(link)) &&
                    (!tool.fallbackCSS || !tool.fallbackCSS.includes(link))
                );

                // Prepare results
                if (missingLinks.length > 0) {
                    toolResult.cssLinksFixed = true;
                    toolResult.missingLinks = missingLinks;
                    toolResult.errors.push(`Missing CSS links: ${missingLinks.join(', ')}`);
                }

                if (unexpectedLinks.length > 0) {
                    toolResult.extraLinks = unexpectedLinks;
                    toolResult.errors.push(`Unexpected CSS links: ${unexpectedLinks.join(', ')}`);
                }

                // Try fallback CSS if expected CSS is missing
                if (missingLinks.length > 0 && tool.fallbackCSS) {
                    const fallbackFound = tool.fallbackCSS.some(css => 
                        existingCSSLinks.includes(css)
                    );
                    
                    if (!fallbackFound) {
                        toolResult.errors.push(`No fallback CSS found for: ${missingLinks.join(', ')}`);
                    }
                }

                results.push(toolResult);
            } catch (error) {
                toolResult.errors.push(error.message);
                results.push(toolResult);
            }
        }

        return results;
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('css-validation-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = results.map(result => `
            <div class="css-validation-result ${result.cssLinksFixed ? 'success' : 'error'}">
                <h3>${result.id}</h3>
                <p>Path: ${result.path}</p>
                <p>CSS Links Status: ${result.cssLinksFixed ? '✅ Needs Attention' : '❌ Problematic'}</p>
                ${result.missingLinks.length > 0 ? `
                    <p>Missing Links: 
                        <ul>
                            ${result.missingLinks.map(link => `<li>${link}</li>`).join('')}
                        </ul>
                    </p>
                ` : ''}
                ${result.extraLinks.length > 0 ? `
                    <p>Unexpected Links: 
                        <ul>
                            ${result.extraLinks.map(link => `<li>${link}</li>`).join('')}
                        </ul>
                    </p>
                ` : ''}
                ${result.errors.length > 0 ? `<p>Errors: ${result.errors.join(', ')}</p>` : ''}
            </div>
        `).join('');

        // Update overall validation status
        const validationStatus = document.getElementById('css-validation-overall-status');
        if (validationStatus) {
            const allPassed = results.every(result => !result.cssLinksFixed);
            validationStatus.textContent = allPassed ? 'All CSS Links Validated ✅' : 'Some CSS Links Need Attention ⚠️';
            validationStatus.className = allPassed ? 'status-success' : 'status-warning';
        }
    }

    async runValidation() {
        const results = await this.validateAndFixCSSLinks();
        this.displayResults(results);
    }
}

// Run validation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const validator = new CSSLinkValidator();
    validator.runValidation();
});