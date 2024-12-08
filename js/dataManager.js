class DataManager {
    constructor() {
        this.dbName = 'SpotifyHistoryDB';
        this.dbVersion = 1;
        this.storeName = 'listeningHistory';
        this.db = null; // Store database connection
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
                
                // Firefox-specific: Handle connection losses
                this.db.onversionchange = () => {
                    this.db.close();
                    alert('Database is outdated, please reload the page.');
                };
                
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

                transaction.oncomplete = () => {
                    console.log('Retrieved files:', request.result);
                    resolve(request.result);
                };

                transaction.onerror = (event) => {
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
                
                // Ensure timestamp is present
                const dataToSave = {
                    ...fileData,
                    timestamp: fileData.timestamp || new Date().toISOString()
                };
                
                const request = store.add(dataToSave);
                
                transaction.oncomplete = () => {
                    console.log('File saved successfully');
                    resolve(request.result);
                };

                transaction.onerror = (event) => {
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

                transaction.oncomplete = () => {
                    console.log('File deleted successfully');
                    resolve();
                };

                transaction.onerror = (event) => {
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

                transaction.oncomplete = () => {
                    console.log('All data cleared successfully');
                    resolve();
                };

                transaction.onerror = (event) => {
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