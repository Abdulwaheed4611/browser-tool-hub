/**
 * Browser Tools Hub - Tool Validator
 * Checks the functionality and links of all tools
 */
class ToolValidator {
    constructor() {
        this.tools = [
            { 
                id: 'pdf-toolkit', 
                path: 'pdf-toolkit/index.html', 
                requiredScripts: [
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
                    'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
                ],
                requiredElements: [
                    '#viewer-file-input', 
                    '#merge-file-input', 
                    '#split-file-input'
                ]
            },
            { 
                id: 'image-editor', 
                path: 'image-editor/index.html', 
                requiredScripts: [],
                requiredElements: [
                    '#image-upload', 
                    '#canvas-container'
                ]
            },
            { 
                id: 'image-compressor', 
                path: 'image-compressor/index.html', 
                requiredScripts: [],
                requiredElements: [
                    '#image-upload', 
                    '#compression-quality'
                ]
            },
            { 
                id: 'qr-generator', 
                path: 'qr-generator/index.html', 
                requiredScripts: [
                    'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'
                ],
                requiredElements: [
                    '#qr-text-input', 
                    '#qr-canvas'
                ]
            },
            { 
                id: 'text-encryption', 
                path: 'text-encryption/index.html', 
                requiredScripts: [],
                requiredElements: [
                    '#encryption-text', 
                    '#encryption-key', 
                    '#encrypt-btn'
                ]
            },
            { 
                id: 'audio-trimmer', 
                path: 'audio-trimmer/index.html', 
                requiredScripts: [],
                requiredElements: [
                    '#audio-upload', 
                    '#start-time', 
                    '#end-time'
                ]
            }
        ];
    }

    async validateToolLinks() {
        const results = [];
        for (const tool of this.tools) {
            const toolResult = {
                id: tool.id,
                path: tool.path,
                linkValid: false,
                scriptsLoaded: false,
                elementsPresent: false,
                errors: []
            };

            try {
                // Fetch HTML file
                const response = await fetch(tool.path);
                toolResult.linkValid = response.ok;

                // Check script dependencies
                if (tool.requiredScripts.length > 0) {
                    const scriptChecks = await Promise.all(
                        tool.requiredScripts.map(async (scriptUrl) => {
                            try {
                                const scriptResponse = await fetch(scriptUrl);
                                return scriptResponse.ok;
                            } catch (scriptError) {
                                return false;
                            }
                        })
                    );
                    toolResult.scriptsLoaded = scriptChecks.every(check => check);
                    if (!toolResult.scriptsLoaded) {
                        toolResult.errors.push('Some external scripts failed to load');
                    }
                } else {
                    toolResult.scriptsLoaded = true;
                }

                // Check for required elements
                if (tool.requiredElements && tool.requiredElements.length > 0) {
                    const iframe = document.createElement('iframe');
                    iframe.src = tool.path;
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);

                    await new Promise(resolve => {
                        iframe.onload = () => {
                            const elementsCheck = tool.requiredElements.every(selector => {
                                const element = iframe.contentDocument.querySelector(selector);
                                return !!element;
                            });
                            toolResult.elementsPresent = elementsCheck;
                            if (!elementsCheck) {
                                toolResult.errors.push('Some required elements are missing');
                            }
                            document.body.removeChild(iframe);
                            resolve();
                        };
                    });
                } else {
                    toolResult.elementsPresent = true;
                }
            } catch (error) {
                toolResult.errors.push(error.message);
            }

            results.push(toolResult);
        }

        return results;
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('tool-validation-results');
        if (!resultsContainer) return;

        // Sort results: errors first, then successes
        const sortedResults = results.sort((a, b) => {
            const aSuccess = a.linkValid && a.scriptsLoaded && a.elementsPresent;
            const bSuccess = b.linkValid && b.scriptsLoaded && b.elementsPresent;
            return aSuccess === bSuccess ? 0 : (aSuccess ? 1 : -1);
        });

        resultsContainer.innerHTML = sortedResults.map(result => `
            <div class="tool-validation-result ${result.linkValid && result.scriptsLoaded && result.elementsPresent ? 'success' : 'error'}">
                <h3>${result.id}</h3>
                <p>Path: ${result.path}</p>
                <p>Link Valid: ${result.linkValid ? '✅' : '❌'}</p>
                <p>Scripts Loaded: ${result.scriptsLoaded ? '✅' : '❌'}</p>
                <p>Elements Present: ${result.elementsPresent ? '✅' : '❌'}</p>
                ${result.errors.length > 0 ? `<p>Errors: ${result.errors.join(', ')}</p>` : ''}
            </div>
        `).join('');

        // Update overall validation status
        const validationStatus = document.getElementById('validation-overall-status');
        if (validationStatus) {
            const allPassed = results.every(result => 
                result.linkValid && result.scriptsLoaded && result.elementsPresent
            );
            validationStatus.textContent = allPassed ? 'All Tools Validated ✅' : 'Some Tools Need Attention ⚠️';
            validationStatus.className = allPassed ? 'status-success' : 'status-warning';
        }
    }

    async runValidation() {
        const results = await this.validateToolLinks();
        this.displayResults(results);
    }
}

// Run validation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const validator = new ToolValidator();
    validator.runValidation();
});