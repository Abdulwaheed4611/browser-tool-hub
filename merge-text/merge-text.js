
document.addEventListener('DOMContentLoaded', () => {
    const textFilesInput = document.getElementById('textFilesInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileListContainer = document.getElementById('fileListContainer');
    const fileList = document.getElementById('fileList');
    const mergeBtn = document.getElementById('mergeBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const mergedText = document.getElementById('mergedText');
    const downloadLink = document.getElementById('downloadLink');

    let files = [];

    fileUploadArea.addEventListener('click', () => textFilesInput.click());

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validations = FileValidator.validateMultipleFiles(droppedFiles, 'text');
        const invalidFiles = validations.filter(v => !v.isValid);
        
        if (invalidFiles.length > 0) {
            alert(`Some files were not added:\n${invalidFiles.map(v => `${v.file.name}: ${v.error}`).join('\n')}`);
        }
        
        files = validations.filter(v => v.isValid).map(v => v.file);
        handleFileSelect();
    });

    textFilesInput.addEventListener('change', (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validations = FileValidator.validateMultipleFiles(selectedFiles, 'text');
        const invalidFiles = validations.filter(v => !v.isValid);
        
        if (invalidFiles.length > 0) {
            alert(`Some files were not added:\n${invalidFiles.map(v => `${v.file.name}: ${v.error}`).join('\n')}`);
        }
        
        files = validations.filter(v => v.isValid).map(v => v.file);
        handleFileSelect();
    });

    function handleFileSelect() {
        if (files.length > 0) {
            fileList.innerHTML = '';
            files.forEach(file => {
                const li = document.createElement('li');
                li.textContent = file.name;
                fileList.appendChild(li);
            });
            fileListContainer.classList.remove('hidden');
            mergeBtn.disabled = false;
        }
    }

    mergeBtn.addEventListener('click', async () => {
        if (files.length === 0) return;

        let mergedContent = '';
        for (const file of files) {
            const content = await file.text();
            mergedContent += content + '\n';
        }

        mergedText.value = mergedContent;
        resultsContainer.classList.remove('hidden');

        const blob = new Blob([mergedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.classList.remove('hidden');
    });
});
