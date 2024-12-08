class DataManager {
    constructor() {
        this.dbName = 'SpotifyHistoryDB';
        this.dbVersion = 1;
        this.storeName = 'listeningHistory';
        this.db = null;
        this.initDatabase();
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            console.log('Initializing database...');
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(request.error);
            };

            request.onsuccess = (event) => {
                console.log('Database opened successfully');
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed');
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    console.log('Object store created');
                }
            };
        });
    }

    async getDatabase() {
        if (this.db) return this.db;
        return this.initDatabase();
    }

    async getAllFiles() {
        try {
            console.log('Getting all files...');
            const db = await this.getDatabase();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    const files = request.result.map(file => ({
                        id: file.id,
                        data: {
                            name: file.name,
                            content: file.content,
                            timestamp: file.timestamp
                        }
                    }));
                    console.log('Retrieved files:', files);
                    resolve(files);
                };

                request.onerror = (event) => {
                    console.error('Error getting files:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error in getAllFiles:', error);
            throw error;
        }
    }

    async saveFile(fileData) {
        try {
            console.log('Saving file data:', fileData);
            const db = await this.getDatabase();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                
                // Structure the data correctly
                const dataToSave = {
                    name: fileData.name,
                    content: fileData.content,
                    timestamp: fileData.timestamp || new Date().toISOString()
                };
                
                console.log('Structured data to save:', dataToSave);
                const request = store.add(dataToSave);
                
                request.onsuccess = () => {
                    console.log('File saved successfully');
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    console.error('Error saving file:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error in saveFile:', error);
            throw error;
        }
    }

    async deleteFile(id) {
        try {
            console.log('Deleting file:', id);
            const db = await this.getDatabase();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(id);

                request.onsuccess = () => {
                    console.log('File deleted successfully');
                    resolve();
                };

                request.onerror = (event) => {
                    console.error('Error deleting file:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error in deleteFile:', error);
            throw error;
        }
    }

    async clearAllData() {
        try {
            console.log('Clearing all data...');
            const db = await this.getDatabase();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onsuccess = () => {
                    console.log('All data cleared successfully');
                    resolve();
                };

                request.onerror = (event) => {
                    console.error('Error clearing data:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error in clearAllData:', error);
            throw error;
        }
    }
}