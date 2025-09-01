// PDF Toolkit Professional JavaScript

// Global variables
let currentPDF = null;
let currentPage = 1;
let totalPages = 0;
let scale = 1.0;
let pdfDoc = null;
let mergeFiles = [];
let currentTool = 'viewer';

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupDragAndDrop();
    showToast('PDF Toolkit loaded successfully!', 'success');
});

// Event Listeners
function initializeEventListeners() {
    // Tool navigation
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTool(this.dataset.tool);
        });
    });

    // File inputs
    document.getElementById('viewerFileInput').addEventListener('change', handleViewerFile);
    document.getElementById('mergerFileInput').addEventListener('change', handleMergerFiles);
    document.getElementById('splitterFileInput').addEventListener('change', handleSplitterFile);
    document.getElementById('extractorFileInput').addEventListener('change', handleExtractorFile);
    document.getElementById('converterFileInput').addEventListener('change', handleConverterFiles);
    document.getElementById('watermarkFileInput').addEventListener('change', handleWatermarkFile);
    document.getElementById('optimizerFileInput').addEventListener('change', handleOptimizerFile);

    // Viewer controls
    document.getElementById('prevPage').addEventListener('click', previousPage);
    document.getElementById('nextPage').addEventListener('click', nextPage);
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);

    // Watermark opacity slider
    const opacitySlider = document.getElementById('watermarkOpacity');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', function() {
            document.getElementById('opacityValue').textContent = Math.round(this.value * 100) + '%';
        });
    }
}

// Drag and Drop functionality
function setupDragAndDrop() {
    const dropZones = document.querySelectorAll('.drop-zone');
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/pdf') {
        if (currentTool === 'viewer') {
            loadPDFForViewer(files[0]);
        }
    }
}

// Tool switching
function switchTool(toolName) {
    currentTool = toolName;
    
    // Update navigation
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${toolName}"]`).classList.add('active');
    
    // Update panels
    document.querySelectorAll('.tool-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${toolName}-panel`).classList.add('active');
}

// PDF Viewer Functions
function handleViewerFile(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        loadPDFForViewer(file);
    } else {
        showToast('Please select a valid PDF file', 'error');
    }
}

async function loadPDFForViewer(file) {
    try {
        showLoading();
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        currentPDF = file;
        pdfDoc = pdf;
        totalPages = pdf.numPages;
        currentPage = 1;
        
        updateFileInfo(file, totalPages);
        await renderPage(currentPage);
        updateViewerControls();
        
        document.getElementById('viewerDropZone').style.display = 'none';
        document.getElementById('pdfCanvas').style.display = 'block';
        
        hideLoading();
        showToast(`PDF loaded successfully! ${totalPages} pages`, 'success');
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        showToast('Error loading PDF file', 'error');
        hideLoading();
    }
}

async function renderPage(pageNum) {
    if (!pdfDoc) return;
    
    try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
    } catch (error) {
        console.error('Error rendering page:', error);
        showToast('Error rendering PDF page', 'error');
    }
}

function updateViewerControls() {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('zoomLevel').textContent = Math.round(scale * 100) + '%';
    
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        updateViewerControls();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        updateViewerControls();
    }
}

function zoomIn() {
    scale = Math.min(scale * 1.25, 3.0);
    renderPage(currentPage);
    updateViewerControls();
}

function zoomOut() {
    scale = Math.max(scale * 0.8, 0.5);
    renderPage(currentPage);
    updateViewerControls();
}

// File Info Display
function updateFileInfo(file, pageCount) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('pageCount').textContent = pageCount;
    document.getElementById('createdDate').textContent = new Date(file.lastModified).toLocaleDateString();
    document.getElementById('fileInfo').style.display = 'block';
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Merge PDFs Functions
function handleMergerFiles(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        if (file.type === 'application/pdf') {
            addFileToMergeList(file);
        }
    });
    updateMergeUI();
}

function addFileToMergeList(file) {
    if (!mergeFiles.find(f => f.name === file.name)) {
        mergeFiles.push(file);
    }
}

function updateMergeUI() {
    const fileList = document.getElementById('mergeFileList');
    const mergeBtn = document.getElementById('mergeBtn');
    
    if (mergeFiles.length === 0) {
        fileList.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                </svg>
                <p>No files selected</p>
                <p class="empty-subtitle">Add PDF files to merge them together</p>
            </div>
        `;
        mergeBtn.disabled = true;
    } else {
        fileList.innerHTML = mergeFiles.map((file, index) => `
            <div class="file-item">
                <div class="file-info-item">
                    <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${formatFileSize(file.size)}</p>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn" onclick="moveFileUp(${index})" ${index === 0 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="18 15 12 9 6 15"/>
                        </svg>
                    </button>
                    <button class="file-action-btn" onclick="moveFileDown(${index})" ${index === mergeFiles.length - 1 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                    <button class="file-action-btn danger" onclick="removeFileFromMerge(${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        mergeBtn.disabled = mergeFiles.length < 2;
    }
}

function moveFileUp(index) {
    if (index > 0) {
        [mergeFiles[index], mergeFiles[index - 1]] = [mergeFiles[index - 1], mergeFiles[index]];
        updateMergeUI();
    }
}

function moveFileDown(index) {
    if (index < mergeFiles.length - 1) {
        [mergeFiles[index], mergeFiles[index + 1]] = [mergeFiles[index + 1], mergeFiles[index]];
        updateMergeUI();
    }
}

function removeFileFromMerge(index) {
    mergeFiles.splice(index, 1);
    updateMergeUI();
}

async function mergePDFs() {
    if (mergeFiles.length < 2) {
        showToast('Please select at least 2 PDF files to merge', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        for (const file of mergeFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        downloadFile(pdfBytes, 'merged-document.pdf', 'application/pdf');
        
        hideLoading();
        showToast('PDFs merged successfully!', 'success');
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        showToast('Error merging PDF files', 'error');
        hideLoading();
    }
}

// Split PDF Functions
function handleSplitterFile(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        currentPDF = file;
        document.getElementById('splitOptions').style.display = 'block';
        document.getElementById('splitEmptyState').style.display = 'none';
        
        // Load PDF to get page count
        loadPDFInfo(file).then(pageCount => {
            document.getElementById('endPage').max = pageCount;
            document.getElementById('startPage').max = pageCount;
            showToast(`PDF loaded! ${pageCount} pages available`, 'success');
        });
    } else {
        showToast('Please select a valid PDF file', 'error');
    }
}

async function loadPDFInfo(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
}

async function splitPDF() {
    if (!currentPDF) {
        showToast('Please select a PDF file first', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const arrayBuffer = await currentPDF.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const splitType = document.querySelector('input[name="splitType"]:checked').value;
        
        if (splitType === 'pages') {
            const startPage = parseInt(document.getElementById('startPage').value) - 1;
            const endPage = parseInt(document.getElementById('endPage').value) - 1;
            
            if (isNaN(startPage) || isNaN(endPage) || startPage < 0 || endPage >= pdf.getPageCount() || startPage > endPage) {
                showToast('Please enter valid page numbers', 'error');
                hideLoading();
                return;
            }
            
            const newPdf = await PDFLib.PDFDocument.create();
            const pages = await newPdf.copyPages(pdf, Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i));
            pages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            downloadFile(pdfBytes, `split-pages-${startPage + 1}-${endPage + 1}.pdf`, 'application/pdf');
            
        } else if (splitType === 'each') {
            const pageCount = pdf.getPageCount();
            
            for (let i = 0; i < pageCount; i++) {
                const newPdf = await PDFLib.PDFDocument.create();
                const [page] = await newPdf.copyPages(pdf, [i]);
                newPdf.addPage(page);
                
                const pdfBytes = await newPdf.save();
                downloadFile(pdfBytes, `page-${i + 1}.pdf`, 'application/pdf');
            }
        }
        
        hideLoading();
        showToast('PDF split successfully!', 'success');
        
    } catch (error) {
        console.error('Error splitting PDF:', error);
        showToast('Error splitting PDF file', 'error');
        hideLoading();
    }
}

// Text Extractor Functions
function handleExtractorFile(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        currentPDF = file;
        document.getElementById('extractBtn').disabled = false;
        document.getElementById('extractorEmptyState').style.display = 'none';
        showToast('PDF loaded! Click "Extract Text" to proceed', 'info');
    } else {
        showToast('Please select a valid PDF file', 'error');
    }
}

async function extractText() {
    if (!currentPDF) {
        showToast('Please select a PDF file first', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const arrayBuffer = await currentPDF.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let extractedText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        
        document.getElementById('extractedText').value = extractedText;
        document.getElementById('textOutput').style.display = 'block';
        
        hideLoading();
        showToast('Text extracted successfully!', 'success');
        
    } catch (error) {
        console.error('Error extracting text:', error);
        showToast('Error extracting text from PDF', 'error');
        hideLoading();
    }
}

function copyExtractedText() {
    const textArea = document.getElementById('extractedText');
    textArea.select();
    document.execCommand('copy');
    showToast('Text copied to clipboard!', 'success');
}

// Converter Functions
function handleConverterFiles(e) {
    const files = Array.from(e.target.files);
    const converterFiles = [];
    
    files.forEach(file => {
        if (file.type.startsWith('image/') || file.type === 'text/plain' || file.type === 'text/html') {
            converterFiles.push(file);
        }
    });
    
    if (converterFiles.length > 0) {
        updateConverterUI(converterFiles);
    } else {
        showToast('Please select valid image or text files', 'error');
    }
}

function updateConverterUI(files) {
    const fileList = document.getElementById('converterFileList');
    document.getElementById('converterOptions').style.display = 'block';
    
    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info-item">
                <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${formatFileSize(file.size)} • ${file.type}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    // Store files for conversion
    window.converterFiles = files;
}

async function convertFiles() {
    if (!window.converterFiles || window.converterFiles.length === 0) {
        showToast('Please select files to convert', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const outputFormat = document.getElementById('outputFormat').value;
        
        if (outputFormat === 'pdf') {
            const pdfDoc = await PDFLib.PDFDocument.create();
            
            for (const file of window.converterFiles) {
                if (file.type.startsWith('image/')) {
                    const arrayBuffer = await file.arrayBuffer();
                    let image;
                    
                    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                        image = await pdfDoc.embedJpg(arrayBuffer);
                    } else if (file.type === 'image/png') {
                        image = await pdfDoc.embedPng(arrayBuffer);
                    } else {
                        continue; // Skip unsupported image types
                    }
                    
                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });
                } else if (file.type === 'text/plain') {
                    const text = await file.text();
                    const page = pdfDoc.addPage();
                    const { width, height } = page.getSize();
                    
                    page.drawText(text, {
                        x: 50,
                        y: height - 50,
                        size: 12,
                        maxWidth: width - 100,
                    });
                }
            }
            
            const pdfBytes = await pdfDoc.save();
            downloadFile(pdfBytes, 'converted-document.pdf', 'application/pdf');
        }
        
        hideLoading();
        showToast('Files converted successfully!', 'success');
        
    } catch (error) {
        console.error('Error converting files:', error);
        showToast('Error converting files', 'error');
        hideLoading();
    }
}

// Watermark Functions
function handleWatermarkFile(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        currentPDF = file;
        document.getElementById('watermarkOptions').style.display = 'block';
        document.getElementById('watermarkEmptyState').style.display = 'none';
        showToast('PDF loaded! Configure watermark settings', 'info');
    } else {
        showToast('Please select a valid PDF file', 'error');
    }
}

async function addWatermark() {
    if (!currentPDF) {
        showToast('Please select a PDF file first', 'error');
        return;
    }
    
    const watermarkText = document.getElementById('watermarkText').value.trim();
    if (!watermarkText) {
        showToast('Please enter watermark text', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const arrayBuffer = await currentPDF.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        
        const opacity = parseFloat(document.getElementById('watermarkOpacity').value);
        const position = document.getElementById('watermarkPosition').value;
        
        pages.forEach(page => {
            const { width, height } = page.getSize();
            let x, y;
            
            // Calculate position
            switch (position) {
                case 'center':
                    x = width / 2;
                    y = height / 2;
                    break;
                case 'top-left':
                    x = 50;
                    y = height - 50;
                    break;
                case 'top-right':
                    x = width - 50;
                    y = height - 50;
                    break;
                case 'bottom-left':
                    x = 50;
                    y = 50;
                    break;
                case 'bottom-right':
                    x = width - 50;
                    y = 50;
                    break;
                default:
                    x = width / 2;
                    y = height / 2;
            }
            
            page.drawText(watermarkText, {
                x: x,
                y: y,
                size: 24,
                opacity: opacity,
                color: PDFLib.rgb(0.7, 0.7, 0.7),
                rotate: PDFLib.degrees(-45),
            });
        });
        
        const pdfBytes = await pdfDoc.save();
        downloadFile(pdfBytes, 'watermarked-document.pdf', 'application/pdf');
        
        hideLoading();
        showToast('Watermark added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding watermark:', error);
        showToast('Error adding watermark to PDF', 'error');
        hideLoading();
    }
}

// Optimizer Functions
function handleOptimizerFile(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        currentPDF = file;
        document.getElementById('optimizerOptions').style.display = 'block';
        document.getElementById('optimizerEmptyState').style.display = 'none';
        showToast('PDF loaded! Configure optimization settings', 'info');
    } else {
        showToast('Please select a valid PDF file', 'error');
    }
}

async function optimizePDF() {
    if (!currentPDF) {
        showToast('Please select a PDF file first', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const arrayBuffer = await currentPDF.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        const removeMetadata = document.getElementById('removeMetadata').checked;
        
        if (removeMetadata) {
            // Remove metadata
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
        }
        
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectStreamsThreshold: 5000,
        });
        
        const originalSize = currentPDF.size;
        const optimizedSize = pdfBytes.length;
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        
        downloadFile(pdfBytes, 'optimized-document.pdf', 'application/pdf');
        
        hideLoading();
        showToast(`PDF optimized! Size reduced by ${savings}%`, 'success');
        
    } catch (error) {
        console.error('Error optimizing PDF:', error);
        showToast('Error optimizing PDF file', 'error');
        hideLoading();
    }
}

// Utility Functions
function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"/>
        </svg>`,
        error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`,
        warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>`,
        info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
        </svg>`
    };
    
    return icons[type] || icons.info;
}

function showHelp() {
    document.getElementById('helpModal').classList.add('show');
}

function hideHelp() {
    document.getElementById('helpModal').classList.remove('show');
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (currentTool === 'viewer' && pdfDoc) {
        if (e.key === 'ArrowLeft' && currentPage > 1) {
            previousPage();
        } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
            nextPage();
        } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomIn();
        } else if (e.key === '-') {
            e.preventDefault();
            zoomOut();
        }
    }
    
    // Close modals with Escape key
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});