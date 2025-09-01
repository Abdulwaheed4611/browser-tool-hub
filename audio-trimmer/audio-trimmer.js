
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const audioFileInput = document.getElementById('audioFileInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const audioInfo = document.getElementById('audioInfo');
    const audioFileName = document.getElementById('audioFileName');
    const audioDuration = document.getElementById('audioDuration');
    const audioSampleRate = document.getElementById('audioSampleRate');
    const waveformContainer = document.getElementById('waveformContainer');
    const waveformEl = document.getElementById('waveform');
    const waveformDisplay = document.getElementById('waveformDisplay');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const trimControls = document.getElementById('trimControls');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const trimSelectionBtn = document.getElementById('trimSelectionBtn');
    const resetSelectionBtn = document.getElementById('resetSelectionBtn');
    const audioEffects = document.getElementById('audioEffects');
    const toggleEffectsBtn = document.getElementById('toggleEffectsBtn');
    const effectsPanel = document.getElementById('effectsPanel');
    const gainControl = document.getElementById('gainControl');
    const gainValueDisplay = document.getElementById('gainValue');
    const speedControl = document.getElementById('speedControl');
    const speedValue = document.getElementById('speedValue');
    const lowpassBtn = document.getElementById('lowpassBtn');
    const highpassBtn = document.getElementById('highpassBtn');
    const reverbBtn = document.getElementById('reverbBtn');
    const trimBtn = document.getElementById('trimBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const audioPlayerContainer = document.getElementById('audioPlayerContainer');
    const exportFormat = document.getElementById('exportFormat');
    const mp3QualityContainer = document.getElementById('mp3QualityContainer');
    const mp3Quality = document.getElementById('mp3Quality');
    const downloadLink = document.getElementById('downloadLink');
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
    
    // Add waveform control event listeners
    playPauseBtn.addEventListener('click', () => {
        if (wavesurfer) {
            wavesurfer.playPause();
        }
    });
    
    stopBtn.addEventListener('click', () => {
        if (wavesurfer) {
            wavesurfer.stop();
        }
    });
    
    zoomInBtn.addEventListener('click', () => {
        if (wavesurfer) {
            zoomLevel = Math.min(zoomLevel * 1.5, 50);
            wavesurfer.zoom(zoomLevel);
            showSuccessMessage(`Zoomed in: ${Math.round(zoomLevel)}x`);
        }
    });
    
    zoomOutBtn.addEventListener('click', () => {
        if (wavesurfer) {
            zoomLevel = Math.max(zoomLevel / 1.5, 1);
            wavesurfer.zoom(zoomLevel);
            showSuccessMessage(`Zoomed out: ${Math.round(zoomLevel)}x`);
        }
    });
    
    // Update filter buttons to use data-active attribute
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.getAttribute('data-filter');
            const isActive = btn.getAttribute('data-active') === 'true';
            
            // Toggle active state
            btn.setAttribute('data-active', !isActive);
            
            // Update filter state
            switch(filterType) {
                case 'lowpass':
                    activeFilters.lowpass = !isActive;
                    break;
                case 'highpass':
                    activeFilters.highpass = !isActive;
                    break;
                case 'reverb':
                    activeFilters.reverb = !isActive;
                    break;
            }
            
            // Apply filters
            applyActiveFilters();
            
            // Show message
            const actionText = !isActive ? 'enabled' : 'disabled';
            showSuccessMessage(`${filterType.charAt(0).toUpperCase() + filterType.slice(1)} filter ${actionText}`);
        });
    });
    
    waveformDisplay.addEventListener('change', () => {
        if (wavesurfer) {
            // Store current region
            const region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
            const regionStart = region.start;
            const regionEnd = region.end;
            
            // Recreate wavesurfer with new display settings
            wavesurfer.destroy();
            handleFileSelect();
            
            // Restore region after wavesurfer is ready
            wavesurfer.on('ready', () => {
                const newRegion = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
                newRegion.start = regionStart;
                newRegion.end = regionEnd;
                startTimeInput.value = formatTime(regionStart);
                endTimeInput.value = formatTime(regionEnd);
            });
        }
    });
    
    trimSelectionBtn.addEventListener('click', () => {
        if (wavesurfer) {
            const region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
            wavesurfer.zoom(30); // Zoom in to see the selection better
            wavesurfer.seekTo(region.start / wavesurfer.getDuration());
            showSuccessMessage('Zoomed to selection');
        }
    });
    
    resetSelectionBtn.addEventListener('click', () => {
        if (wavesurfer) {
            const region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
            region.start = 0;
            region.end = wavesurfer.getDuration();
            startTimeInput.value = formatTime(0);
            endTimeInput.value = formatTime(wavesurfer.getDuration());
            showSuccessMessage('Selection reset to full audio');
        }
    });
    
    // Add event listeners for time input changes
    startTimeInput.addEventListener('change', () => {
        if (wavesurfer) {
            const region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
            const time = parseTime(startTimeInput.value);
            if (time !== null && time >= 0 && time < region.end) {
                region.start = time;
                startTimeInput.value = formatTime(time);
            } else {
                startTimeInput.value = formatTime(region.start);
                showErrorMessage('Invalid start time');
            }
        }
    });
    
    endTimeInput.addEventListener('change', () => {
        if (wavesurfer) {
            const region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
            const time = parseTime(endTimeInput.value);
            if (time !== null && time > region.start && time <= wavesurfer.getDuration()) {
                region.end = time;
                endTimeInput.value = formatTime(time);
            } else {
                endTimeInput.value = formatTime(region.end);
                showErrorMessage('Invalid end time');
            }
        }
    });
    
    // Helper function to parse time in format MM:SS.ms
    function parseTime(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return null;
        
        const minutes = parseInt(parts[0], 10);
        const seconds = parseFloat(parts[1]);
        
        if (isNaN(minutes) || isNaN(seconds)) return null;
        
        return minutes * 60 + seconds;
    }

    // State variables
    let wavesurfer;
    let audioFile;
    let audioContext;
    let gainNode;
    let lowpassFilter;
    let highpassFilter;
    let convolver;
    let impulseResponse = null;
    let currentProcessedBuffer = null;
    let activeFilters = {
        lowpass: false,
        highpass: false,
        reverb: false
    };
    let playbackSpeed = 1.0;
    let zoomLevel = 1;
    let gainValue = 1.0;
    let lowpassFreq = 800;
    let highpassFreq = 1500;
    let isLowpassActive = false;
    let isHighpassActive = false;
    let isReverbActive = false;

    fileUploadArea.addEventListener('click', () => audioFileInput.click());

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
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            try {
                const validation = FileValidator.validateFile(files[0], 'audio');
                if (validation.isValid) {
                    audioFile = files[0];
                    showUploadProgress();
                    setTimeout(() => {
                        handleFileSelect();
                        hideUploadProgress();
                    }, 1000);
                } else {
                    // Show error message
                    showErrorMessage(validation.error);
                }
            } catch (error) {
                showErrorMessage('Error validating file. Please try again.');
                console.error('File validation error:', error);
            }
        }
    });

    audioFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const validation = FileValidator.validateFile(file, 'audio');
                if (validation.isValid) {
                    audioFile = file;
                    showUploadProgress();
                    setTimeout(() => {
                        handleFileSelect();
                        hideUploadProgress();
                    }, 1000);
                } else {
                    // Show error message
                    showErrorMessage(validation.error);
                }
            } catch (error) {
                showErrorMessage('Error validating file. Please try again.');
                console.error('File validation error:', error);
            }
        }
    });
    
    // Helper functions for UI feedback
    function showUploadProgress() {
        const uploadProgress = document.querySelector('.upload-progress');
        const uploadText = document.querySelector('.upload-text');
        const uploadSubtext = document.querySelector('.upload-subtext');
        
        if (uploadProgress) {
            uploadProgress.classList.remove('hidden');
            uploadText.classList.add('hidden');
            uploadSubtext.classList.add('hidden');
            
            // Animate progress bar
            const progressFill = uploadProgress.querySelector('.progress-fill');
            const progressText = uploadProgress.querySelector('.progress-text');
            
            progressFill.style.width = '0%';
            progressText.textContent = 'Processing...';
            
            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                progressFill.style.width = `${Math.min(progress, 100)}%`;
                progressText.textContent = `Processing... ${Math.min(progress, 100)}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 50);
        }
    }
    
    function hideUploadProgress() {
        const uploadProgress = document.querySelector('.upload-progress');
        const uploadText = document.querySelector('.upload-text');
        const uploadSubtext = document.querySelector('.upload-subtext');
        
        if (uploadProgress) {
            uploadProgress.classList.add('hidden');
            uploadText.classList.remove('hidden');
            uploadSubtext.classList.remove('hidden');
        }
    }
    
    function showErrorMessage(message) {
        showToast(message, 'error');
    }
    
    function showSuccessMessage(message) {
        showToast(message, 'success');
    }
    
    function showToast(message, type = 'error') {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
        const iconColor = type === 'success' ? '#10b981' : '#ef4444';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i data-lucide="${iconName}" class="toast-icon" style="color: ${iconColor}"></i>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i data-lucide="x"></i></button>
        `;
        
        document.body.appendChild(toast);
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Add close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.add('toast-hiding');
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('toast-visible');
        }, 10);
    }

    function handleFileSelect() {
        if (audioFile) {
            // Display file information
            audioFileName.textContent = audioFile.name;
            audioInfo.classList.remove('hidden');
            waveformContainer.classList.remove('hidden');
            trimControls.classList.remove('hidden');
            audioEffects.classList.remove('hidden');
            trimBtn.disabled = false;

            // Clean up previous wavesurfer instance if it exists
            if (wavesurfer) {
                wavesurfer.destroy();
            }

            // Initialize audio context for effects
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                setupAudioEffects();
            }

            // Create wavesurfer instance with current display settings
            const waveformSettings = getWaveformSettings();
            wavesurfer = WaveSurfer.create({
                container: waveformEl,
                waveColor: '#d1d5db',
                progressColor: '#2563eb',
                cursorColor: '#1d4ed8',
                responsive: true,
                height: 120,
                barWidth: waveformSettings.barWidth,
                barGap: waveformSettings.barGap,
                barRadius: waveformSettings.barRadius,
                cursorWidth: 2,
                normalize: true,
                plugins: [
                    WaveSurfer.timeline.create({
                        container: '#waveform-timeline',
                        primaryLabelInterval: 5,
                        secondaryLabelInterval: 1,
                        primaryColor: '#2563eb',
                        secondaryColor: '#6b7280',
                        primaryFontColor: '#374151',
                        secondaryFontColor: '#6b7280'
                    }),
                    WaveSurfer.regions.create({
                        regionsMinLength: 0.1,
                        regions: [
                            {   
                                start: 0,
                                end: 1,
                                loop: false,
                                color: 'rgba(37, 99, 235, 0.2)',
                                drag: true,
                                resize: true
                            }
                        ],
                        dragSelection: {
                            slop: 5
                        }
                    })
                ]
            });

            // Load audio file
            const fileURL = URL.createObjectURL(audioFile);
            wavesurfer.load(fileURL);

            // Event listeners for wavesurfer
    wavesurfer.on('ready', () => {
        const duration = wavesurfer.getDuration();
        audioDuration.textContent = formatTime(duration);
        endTimeInput.value = formatTime(duration);
        
        // Get sample rate from decoded audio
        const sampleRate = wavesurfer.backend.buffer.sampleRate;
        audioSampleRate.textContent = `${sampleRate} Hz`;
        
        // Set region to full audio length
        const region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
        region.end = duration;
        
        // Update playback speed if it was changed
        wavesurfer.setPlaybackRate(playbackSpeed);
        
        // Apply active filters if any
        applyActiveFilters();
        
        // Show success message
        showSuccessMessage('Audio loaded successfully!');
        
        // Update UI to show audio is loaded
        document.querySelectorAll('.section-title').forEach(title => {
            title.classList.remove('text-gray-400');
            title.classList.add('text-gray-800');
        });
        
        // Enable process button
        trimBtn.disabled = false;
        trimBtn.classList.remove('btn-disabled');
        trimBtn.classList.add('btn-primary');
            });

            wavesurfer.on('region-updated', (region) => {
                startTimeInput.value = formatTime(region.start);
                endTimeInput.value = formatTime(region.end);
            });
            
            wavesurfer.on('play', () => {
                playPauseBtn.innerHTML = '<i data-lucide="pause"></i><span>Pause</span>';
                lucide.createIcons();
            });
            
            wavesurfer.on('pause', () => {
                playPauseBtn.innerHTML = '<i data-lucide="play"></i><span>Play</span>';
                lucide.createIcons();
            });
            
            wavesurfer.on('finish', () => {
                playPauseBtn.innerHTML = '<i data-lucide="play"></i><span>Play</span>';
                lucide.createIcons();
            });
        }
    }
    
    function getWaveformSettings() {
        const displayType = waveformDisplay.value;
        let settings = {
            barWidth: 3,
            barGap: 1,
            barRadius: 3
        };
        
        switch(displayType) {
            case 'bars':
                settings.barWidth = 4;
                settings.barGap = 2;
                settings.barRadius = 2;
                break;
            case 'line':
                settings.barWidth = 1;
                settings.barGap = 0;
                settings.barRadius = 0;
                break;
            default: // standard
                settings.barWidth = 3;
                settings.barGap = 1;
                settings.barRadius = 3;
        }
        
        return settings;
    }
    
    function setupAudioEffects() {
        // Create audio nodes
        gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;
        
        // Create filters
        lowpassFilter = audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 800;
        lowpassFilter.Q.value = 1;
        
        highpassFilter = audioContext.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.value = 1500;
        highpassFilter.Q.value = 1;
        
        // Setup reverb (will load impulse response later)
        convolver = audioContext.createConvolver();
    }

    trimBtn.addEventListener('click', () => {
        if (!wavesurfer) return;

        const region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
        if (!region) return;

        const originalBuffer = wavesurfer.backend.buffer;
        const newBuffer = wavesurfer.backend.ac.createBuffer(
            originalBuffer.numberOfChannels,
            (region.end - region.start) * originalBuffer.sampleRate,
            originalBuffer.sampleRate
        );

        for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
            const channel = originalBuffer.getChannelData(i);
            const newChannel = newBuffer.getChannelData(i);
            const startOffset = Math.floor(region.start * originalBuffer.sampleRate);
            const endOffset = Math.floor(region.end * originalBuffer.sampleRate);
            newChannel.set(channel.subarray(startOffset, endOffset));
        }
        
        // Apply audio effects if enabled
     let processedBuffer = newBuffer;
     if (activeFilters.lowpass || activeFilters.highpass || activeFilters.reverb || gainValue !== 1.0 || playbackSpeed !== 1.0) {
         processedBuffer = applyEffectsToBuffer(newBuffer);
     }
     
     // Store the processed buffer for export options
     currentProcessedBuffer = processedBuffer;
     
     // Enable export options
     document.getElementById('exportOptions').classList.remove('hidden');

        // Create WAV buffer for playback
        const wavBuffer = audioBufferToWav(processedBuffer);
        const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.controls = true;
        audioPlayerContainer.innerHTML = '';
        audioPlayerContainer.appendChild(audio);

        downloadLink.href = audioUrl;
        downloadLink.download = `trimmed-${audioFile.name}`;
        downloadLink.classList.remove('hidden');
        resultsContainer.classList.remove('hidden');
        
        // Show export format options
     mp3QualityContainer.style.display = exportFormat.value === 'mp3' ? 'block' : 'none';
     
     // Function to apply audio effects to buffer
     function applyEffectsToBuffer(buffer) {
         // If no effects are active, return the original buffer
         if (!activeFilters.lowpass && !activeFilters.highpass && !activeFilters.reverb && gainValue === 1.0 && playbackSpeed === 1.0) {
             return buffer;
         }
         
         // Create an offline audio context for processing
         const offlineCtx = new OfflineAudioContext(
             buffer.numberOfChannels,
             buffer.length,
             buffer.sampleRate
         );
         
         // Create source node
         const source = offlineCtx.createBufferSource();
         source.buffer = buffer;
         
         // Create and connect effect nodes
         let currentNode = source;
         
         // Apply gain
         if (gainValue !== 1.0) {
             const gain = offlineCtx.createGain();
             gain.gain.value = gainValue;
             currentNode.connect(gain);
             currentNode = gain;
         }
         
         // Apply playback speed (requires resampling)
         if (playbackSpeed !== 1.0) {
             // Adjust buffer length based on playback speed
             const newLength = Math.floor(buffer.length / playbackSpeed);
             const speedAdjustedBuffer = offlineCtx.createBuffer(
                 buffer.numberOfChannels,
                 newLength,
                 buffer.sampleRate
             );
             
             // Resample each channel
             for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                 const inputData = buffer.getChannelData(channel);
                 const outputData = speedAdjustedBuffer.getChannelData(channel);
                 
                 for (let i = 0; i < newLength; i++) {
                     const originalIndex = Math.floor(i * playbackSpeed);
                     if (originalIndex < buffer.length) {
                         outputData[i] = inputData[originalIndex];
                     }
                 }
             }
             
             // Replace source with speed-adjusted buffer
             source.disconnect();
             const newSource = offlineCtx.createBufferSource();
             newSource.buffer = speedAdjustedBuffer;
             currentNode = newSource;
         }
         
         // Apply lowpass filter if active
         if (activeFilters.lowpass) {
             const lowpass = offlineCtx.createBiquadFilter();
             lowpass.type = 'lowpass';
             lowpass.frequency.value = lowpassFreq;
             lowpass.Q.value = 1;
             currentNode.connect(lowpass);
             currentNode = lowpass;
         }
         
         // Apply highpass filter if active
         if (activeFilters.highpass) {
             const highpass = offlineCtx.createBiquadFilter();
             highpass.type = 'highpass';
             highpass.frequency.value = highpassFreq;
             highpass.Q.value = 1;
             currentNode.connect(highpass);
             currentNode = highpass;
         }
         
         // Apply reverb if active and impulse response is loaded
         if (activeFilters.reverb && impulseResponse) {
             const convolver = offlineCtx.createConvolver();
             convolver.buffer = impulseResponse;
             currentNode.connect(convolver);
             currentNode = convolver;
         }
         
         // Connect to destination
         currentNode.connect(offlineCtx.destination);
         
         // Start the source
         source.start(0);
         
         // Render the audio
         return offlineCtx.startRendering().then(renderedBuffer => {
             return renderedBuffer;
         }).catch(err => {
             console.error('Rendering failed: ' + err);
             return buffer; // Return original buffer on error
         });
     }
     
     // Function to apply active filters to wavesurfer playback
     function applyActiveFilters() {
         if (!wavesurfer || !audioContext) return;
         
         // Update filter states
         if (lowpassFilter) {
             lowpassFilter.frequency.value = lowpassFreq;
             activeFilters.lowpass = isLowpassActive;
         }
         
         if (highpassFilter) {
             highpassFilter.frequency.value = highpassFreq;
             activeFilters.highpass = isHighpassActive;
         }
         
         activeFilters.reverb = isReverbActive;
         
         // Apply volume
         if (gainNode) {
             gainNode.gain.value = gainValueDisplay;
         }
     }
     
     // Function to load impulse response for reverb
     function loadImpulseResponse() {
         if (!audioContext || !isReverbActive) return;
         
         // Use a simple impulse response for reverb
         // In a real app, you would load an actual impulse response file
         const sampleRate = audioContext.sampleRate;
         const length = sampleRate * 2; // 2 seconds
         impulseResponse = audioContext.createBuffer(2, length, sampleRate);
         
         // Fill with exponentially decaying noise
         for (let channel = 0; channel < 2; channel++) {
             const data = impulseResponse.getChannelData(channel);
             for (let i = 0; i < length; i++) {
                 data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.5));
             }
         }
         
         if (convolver) {
             convolver.buffer = impulseResponse;
         }
     }
     
     // Function to export audio in different formats
     function exportAudio() {
         if (!currentProcessedBuffer) return;
         
         const format = exportFormat.value;
         let blob, fileName;
         
         switch (format) {
             case 'wav':
                 blob = new Blob([audioBufferToWav(currentProcessedBuffer)], { type: 'audio/wav' });
                 fileName = `trimmed-${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;
                 break;
                 
             case 'mp3':
                 // In a real implementation, you would use a library like lamejs to encode MP3
                 // For this demo, we'll just use WAV format
                 blob = new Blob([audioBufferToWav(currentProcessedBuffer)], { type: 'audio/wav' });
                 fileName = `trimmed-${audioFile.name.replace(/\.[^/.]+$/, '')}.mp3`;
                 break;
                 
             case 'ogg':
                 // In a real implementation, you would use a library to encode OGG
                 // For this demo, we'll just use WAV format
                 blob = new Blob([audioBufferToWav(currentProcessedBuffer)], { type: 'audio/wav' });
                 fileName = `trimmed-${audioFile.name.replace(/\.[^/.]+$/, '')}.ogg`;
                 break;
                 
             default:
                 blob = new Blob([audioBufferToWav(currentProcessedBuffer)], { type: 'audio/wav' });
                 fileName = `trimmed-${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;
         }
         
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = fileName;
         a.click();
         URL.revokeObjectURL(url);
     }
     
     // Function to copy audio to clipboard
     function copyAudioToClipboard() {
         if (!trimmedAudio.src) return;
         
         // In a real implementation, you would use the Clipboard API
         // For this demo, we'll just show a notification
         const notification = document.createElement('div');
         notification.className = 'notification success';
         notification.textContent = 'Audio URL copied to clipboard (simulated)';
         document.body.appendChild(notification);
         
         // Remove notification after 3 seconds
         setTimeout(() => {
             document.body.removeChild(notification);
         }, 3000);
     }
    });

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = (time % 60).toFixed(3);
        return `${minutes}:${seconds.padStart(6, '0')}`;
    }

    // Function to convert AudioBuffer to WAV
    function audioBufferToWav(buffer) {
        let numOfChan = buffer.numberOfChannels,
            btwLength = buffer.length * numOfChan * 2 + 44,
            btwArrBuff = new ArrayBuffer(btwLength),
            btwView = new DataView(btwArrBuff),
            btwChnls = [],
            btwIndex,
            btwSample,
            btwOffset = 0,
            btwPos = 0;
        setUint32(0x46464952); // "RIFF"
        setUint32(btwLength - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);
        setUint16(16); // 16-bit sample
        setUint32(0x61746164); // "data" chunk
        setUint32(btwLength - btwPos); // chunk length

        for (btwIndex = 0; btwIndex < buffer.numberOfChannels; btwIndex++) {
            btwChnls.push(buffer.getChannelData(btwIndex));
        }

        while (btwPos < btwLength) {
            for (btwIndex = 0; btwIndex < numOfChan; btwIndex++) {
                btwSample = Math.max(-1, Math.min(1, btwChnls[btwIndex][btwOffset])); // clamp
                btwSample = (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
                btwView.setInt16(btwPos, btwSample, true);
                btwPos += 2;
            }
            btwOffset++;
        }

        return btwArrBuff;

        function setUint16(data) {
            btwView.setUint16(btwPos, data, true);
            btwPos += 2;
        }

        function setUint32(data) {
            btwView.setUint32(btwPos, data, true);
            btwPos += 4;
        }
    }
});
