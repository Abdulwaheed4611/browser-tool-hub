const allTools = [
    {
        id: 'pdf-toolkit',
        title: 'PDF Toolkit',
        description: 'Viewer, merge, split, extract text, convert and compress PDFs — all client-side',
        icon: 'file-text',
        href: 'pdf-toolkit/index.html',
        category: 'Files',
        searchKeywords: 'pdf toolkit viewer merge split extract images compress'
    },
    
    {
        id: 'zip-extractor',
        title: 'ZIP Extractor',
        description: 'Extract and view contents of ZIP files',
        icon: 'archive',
        href: 'zip-extractor/index.html',
        category: 'Files',
        searchKeywords: 'zip extractor unzip'
    },
    {
        id: 'merge-text',
        title: 'Merge Text Files',
        description: 'Combine multiple text files into one',
        icon: 'merge',
        href: 'merge-text/index.html',
        category: 'Files',
        searchKeywords: 'merge text files combine'
    },
    {
        id: 'image-compressor',
        title: 'Image Compressor',
        description: 'Compress images to reduce file size',
        icon: 'compress',
        href: 'image-compressor/index.html',
        category: 'Images',
        searchKeywords: 'image compressor compress reduce size'
    },
    {
        id: 'image-converter',
        title: 'Image Converter',
        description: 'Convert between JPG, PNG, WebP formats',
        icon: 'repeat',
        href: 'image-converter/index.html',
        category: 'Images',
        searchKeywords: 'image converter format jpg png webp'
    },
    {
        id: 'image-editor',
        title: 'Image Editor',
        description: 'Advanced image editor with background remover, filters, and more.',
        icon: 'edit-3',
        href: 'image-editor/index.html',
        category: 'Images',
        searchKeywords: 'image editor crop rotate filter background remover changer text draw shapes'
    },
    {
        id: 'word-counter',
        title: 'Word Counter',
        description: 'Count words, characters, and paragraphs',
        icon: 'hash',
        href: 'word-counter/index.html',
        category: 'Text',
        searchKeywords: 'word character counter count'
    },
    {
        id: 'case-converter',
        title: 'Case Converter',
        description: 'Convert text to different cases',
        icon: 'case-sensitive',
        href: 'case-converter/index.html',
        category: 'Text',
        searchKeywords: 'case converter uppercase lowercase title'
    },
    {
        id: 'text-to-pdf',
        title: 'Text to PDF',
        description: 'Convert text content to PDF file',
        icon: 'file-type',
        href: 'text-to-pdf/index.html',
        category: 'Text',
        searchKeywords: 'text to pdf convert'
    },
    {
        id: 'markdown-previewer',
        title: 'Markdown Previewer',
        description: 'Preview Markdown as HTML in real-time',
        icon: 'markdown',
        href: 'markdown-preview/index.html',
        category: 'Text',
        searchKeywords: 'markdown html preview'
    },
    {
        id: 'audio-trimmer',
        title: 'Audio Trimmer',
        description: 'Trim audio files to desired length',
        icon: 'scissors',
        href: 'audio-trimmer/index.html',
        category: 'Media',
        searchKeywords: 'audio trimmer cut'
    },
    {
        id: 'media-recorder',
        title: 'Media Recorder',
        description: 'Record audio and video using your device',
        icon: 'mic',
        href: 'media-recorder/index.html',
        category: 'Media',
        searchKeywords: 'record audio video'
    },
    {
        id: 'audio-extractor',
        title: 'Audio Extractor',
        description: 'Extract audio track from video files',
        icon: 'volume-2',
        href: 'audio-extractor/index.html',
        category: 'Media',
        searchKeywords: 'extract audio from video'
    },
    {
        id: 'password-generator',
        title: 'Password Generator',
        description: 'Generate strong, secure passwords',
        icon: 'key',
        href: 'password-generator/index.html',
        category: 'Security',
        searchKeywords: 'password generator create'
    },
    {
        id: 'hash-generator',
        title: 'Hash Generator',
        description: 'Generate MD5 and SHA256 hashes',
        icon: 'hash',
        href: 'hash-generator/index.html',
        category: 'Security',
        searchKeywords: 'hash generator md5 sha256'
    },
    {
        id: 'text-encryption',
        title: 'Text Encryption',
        description: 'Encrypt and decrypt text using AES',
        icon: 'lock',
        href: 'text-encryption/index.html',
        category: 'Security',
        searchKeywords: 'encrypt decrypt text aes'
    },
    {
        id: 'qr-generator',
        title: 'QR Code Generator',
        description: 'Generate QR codes from text or URLs',
        icon: 'qr-code',
        href: 'qr-generator/index.html',
        category: 'Utilities',
        searchKeywords: 'qr code generator create'
    },
    {
        id: 'qr-scanner',
        title: 'QR Code Scanner',
        description: 'Scan QR codes using your camera',
        icon: 'scan',
        href: 'qr-scanner/index.html',
        category: 'Utilities',
        searchKeywords: 'qr code scanner read'
    },
    {
        id: 'barcode-generator',
        title: 'Barcode Generator',
        description: 'Generate various types of barcodes',
        icon: 'barcode',
        href: 'barcode-generator/index.html',
        category: 'Utilities',
        searchKeywords: 'barcode generator create'
    },
    {
        id: 'random-picker',
        title: 'Random Picker',
        description: 'Pick random numbers, names, or items',
        icon: 'shuffle',
        href: 'random-picker/index.html',
        category: 'Utilities',
        searchKeywords: 'random picker number name'
    },
    {
        id: 'timer-stopwatch',
        title: 'Timer & Stopwatch',
        description: 'Stopwatch, timer, and clock tool',
        icon: 'timer',
        href: 'timer-stopwatch/index.html',
        category: 'Utilities',
        searchKeywords: 'timer stopwatch clock'
    },
    {
        id: 'unit-converter',
        title: 'Unit Converter',
        description: 'Convert units of measurement',
        icon: 'calculator',
        href: 'unit-converter/index.html',
        category: 'Utilities',
        searchKeywords: 'unit converter length weight temperature'
    }
];