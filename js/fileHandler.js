const dataManager = new DataManager();

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const importSection = document.querySelector('.import-section');
    const dataList = document.getElementById('dataList');

    loadFiles();

    fileInput.addEventListener('change', handleFileSelect);
    
    importSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        importSection.style.borderColor = 'rgba(255, 255, 255, 0.6)';
        importSection.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    importSection.addEventListener('dragleave', (e) => {
        e.preventDefault();
        importSection.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        importSection.style.background = 'transparent';
    });

    importSection.addEventListener('drop', handleFileDrop);
});

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await processFile(file);
    }
}

async function handleFileDrop(event) {
    event.preventDefault();
    const importSection = event.currentTarget;
    importSection.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    importSection.style.background = 'transparent';

    const file = event.dataTransfer.files[0];
    if (file) {
        await processFile(file);
    }
}

async function processFile(file) {
    try {
        console.log('Processing file:', file.name);
        const fileContent = await readFileContent(file);
        console.log('File content parsed:', fileContent.length, 'entries');
        
        // Validate that it's a Spotify history file
        const isValid = fileContent.every(entry => 
            entry.ts && 
            entry.master_metadata_track_name !== undefined &&
            entry.master_metadata_album_artist_name !== undefined
        );

        if (!isValid) {
            throw new Error('Invalid file format: Not a Spotify listening history file');
        }

        await dataManager.saveFile({
            name: file.name,
            content: fileContent,
            timestamp: new Date().toISOString()
        });
        
        await loadFiles();
    } catch (error) {
        console.error('Error processing file:', error);
        alert(error.message);
    }
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

async function loadFiles() {
    try {
        const dataList = document.getElementById('dataList');
        const files = await dataManager.getAllFiles();
        
        dataList.innerHTML = files.map(file => {
            // Check if file.data exists and contains the content
            const content = file.data?.content || [];
            const trackCount = content.length;
            
            let dateRange = '';
            if (trackCount > 0) {
                const firstDate = new Date(content[0].ts).toLocaleDateString();
                const lastDate = new Date(content[content.length - 1].ts).toLocaleDateString();
                dateRange = `<span class="date-range">${firstDate} - ${lastDate}</span>`;
            }
            
            return `
                <div class="data-item">
                    <div class="file-info">
                        <strong>${file.data?.name || 'Unnamed File'}</strong>
                        <span class="track-count">${trackCount} tracks</span>
                        ${dateRange}
                    </div>
                    <div class="data-item-right">
                        <span class="import-date">Imported: ${new Date(file.timestamp).toLocaleString()}</span>
                        <button class="delete-btn" onclick="deleteFile(${file.id})">×</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading files:', error);
        dataList.innerHTML = '<div class="error">Error loading files</div>';
    }
}

async function deleteFile(id) {
    try {
        await dataManager.deleteFile(id);
        await loadFiles();
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file');
    }
} 