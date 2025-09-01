
document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdownInput');
    const previewPane = document.getElementById('previewPane');

    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });

    function updatePreview() {
        previewPane.innerHTML = marked.parse(markdownInput.value);
    }

    markdownInput.addEventListener('input', updatePreview);

    // Initial preview
    updatePreview();
});
