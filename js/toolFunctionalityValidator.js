/**
 * Tool Functionality Validator
 * Comprehensive validation of tool functionality across the Browser Tools Hub
 */
class ToolFunctionalityValidator {
    constructor() {
        this.tools = [
            {
                id: 'qr-generator',
                path: 'qr-generator/index.html',
                requiredElements: [
                    '#qrText',
                    '#btnGenerate',
                    '#btnDownload',
                    '#qrcode'
                ],
                functionalityTests: [
                    {
                        name: 'Text Input',
                        test: async (page) => {
                            const input = await page.querySelector('#qrText');
                            return input && input.placeholder === 'e.g., https://example.com or Hello World';
                        }
                    },
                    {
                        name: 'Generate Button',
                        test: async (page) => {
                            const btn = await page.querySelector('#btnGenerate');
                            return btn && btn.textContent.includes('Generate QR');
                        }
                    },
                    {
                        name: 'QR Code Generation',
                        test: async (page) => {
                            const input = await page.querySelector('#qrText');
                            const generateBtn = await page.querySelector('#btnGenerate');
                            
                            // Simulate user input
                            input.value = 'https://example.com';
                            generateBtn.click();

                            // Wait for QR code to generate
                            await new Promise(resolve => setTimeout(resolve, 500));

                            const qrCode = await page.querySelector('#qrcode canvas');
                            return qrCode && qrCode.width > 0 && qrCode.height > 0;
                        }
                    }
                ]
            },
            {
                id: 'image-compressor',
                path: 'image-compressor/index.html',
                requiredElements: [
                    '#image-upload',
                    '#compression-quality',
                    '#compress-btn'
                ],
                functionalityTests: [
                    {
                        name: 'Image Upload',
                        test: async (page) => {
                            const uploadInput = await page.querySelector('#image-upload');
                            return uploadInput && uploadInput.type === 'file';
                        }
                    },
                    {
                        name: 'Compression Quality',
                        test: async (page) => {
                            const qualitySlider = await page.querySelector('#compression-quality');
                            return qualitySlider && 
                                   qualitySlider.min === '0' && 
                                   qualitySlider.max === '100';
                        }
                    }
                ]
            },
            {
                id: 'text-encryption',
                path: 'text-encryption/index.html',
                requiredElements: [
                    '#encryption-text',
                    '#encryption-key',
                    '#encrypt-btn',
                    '#decrypt-btn'
                ],
                functionalityTests: [
                    {
                        name: 'Encryption Input',
                        test: async (page) => {
                            const textInput = await page.querySelector('#encryption-text');
                            return textInput && textInput.placeholder === 'Enter text to encrypt/decrypt';
                        }
                    },
                    {
                        name: 'Encryption Process',
                        test: async (page) => {
                            const textInput = await page.querySelector('#encryption-text');
                            const keyInput = await page.querySelector('#encryption-key');
                            const encryptBtn = await page.querySelector('#encrypt-btn');
                            const resultArea = await page.querySelector('#encryption-result');

                            // Simulate encryption
                            textInput.value = 'Test Message';
                            keyInput.value = 'SecretKey123';
                            encryptBtn.click();

                            // Wait for encryption
                            await new Promise(resolve => setTimeout(resolve, 500));

                            const encryptedText = resultArea.value;
                            return encryptedText && encryptedText !== 'Test Message';
                        }
                    }
                ]
            }
        ];
    }

    async validateToolFunctionality() {
        const results = [];

        for (const tool of this.tools) {
            const toolResult = {
                id: tool.id,
                path: tool.path,
                elementsPresent: true,
                functionalityPassed: true,
                errors: []
            };

            try {
                // Create an iframe to test the tool
                const iframe = document.createElement('iframe');
                iframe.src = tool.path;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // Wait for iframe to load
                await new Promise(resolve => {
                    iframe.onload = resolve;
                });

                // Check required elements
                for (const selector of tool.requiredElements) {
                    const element = iframe.contentDocument.querySelector(selector);
                    if (!element) {
                        toolResult.elementsPresent = false;
                        toolResult.errors.push(`Missing required element: ${selector}`);
                    }
                }

                // Run functionality tests
                for (const test of tool.functionalityTests) {
                    try {
                        const testResult = await test.test(iframe.contentDocument);
                        if (!testResult) {
                            toolResult.functionalityPassed = false;
                            toolResult.errors.push(`Functionality test failed: ${test.name}`);
                        }
                    } catch (testError) {
                        toolResult.functionalityPassed = false;
                        toolResult.errors.push(`Test error in ${test.name}: ${testError.message}`);
                    }
                }

                // Clean up
                document.body.removeChild(iframe);

                results.push(toolResult);
            } catch (error) {
                toolResult.errors.push(`Validation error: ${error.message}`);
                results.push(toolResult);
            }
        }

        return results;
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('tool-functionality-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = results.map(result => `
            <div class="tool-functionality-result ${result.elementsPresent && result.functionalityPassed ? 'success' : 'error'}">
                <h3>${result.id}</h3>
                <p>Path: ${result.path}</p>
                <p>Elements Present: ${result.elementsPresent ? '✅' : '❌'}</p>
                <p>Functionality: ${result.functionalityPassed ? '✅ Working' : '❌ Issues Detected'}</p>
                ${result.errors.length > 0 ? `
                    <p>Errors: 
                        <ul>
                            ${result.errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </p>
                ` : ''}
            </div>
        `).join('');

        // Update overall functionality status
        const functionalityStatus = document.getElementById('tool-functionality-overall-status');
        if (functionalityStatus) {
            const allPassed = results.every(result => 
                result.elementsPresent && result.functionalityPassed
            );
            functionalityStatus.textContent = allPassed 
                ? 'All Tools Functional ✅' 
                : 'Some Tools Have Functionality Issues ⚠️';
            functionalityStatus.className = allPassed 
                ? 'status-success' 
                : 'status-warning';
        }
    }

    async runValidation() {
        const results = await this.validateToolFunctionality();
        this.displayResults(results);
    }
}

// Run validation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const validator = new ToolFunctionalityValidator();
    validator.runValidation();
});