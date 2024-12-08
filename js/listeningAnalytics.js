document.addEventListener('DOMContentLoaded', async () => {
    const dataManager = new DataManager();
    const stats = document.getElementById('stats');

    try {
        const files = await dataManager.getAllFiles();
        console.log('Files loaded:', files); // Debug log

        // Combine all listening data from all files
        let allTracks = [];
        files.forEach(file => {
            console.log('Processing file:', file); // Debug log
            if (file.data?.content) {
                allTracks = allTracks.concat(file.data.content);
            }
        });

        console.log('Total tracks found:', allTracks.length); // Debug log

        if (allTracks.length > 0) {
            // Sort by timestamp (oldest first)
            allTracks.sort((a, b) => new Date(a.ts) - new Date(b.ts));
            const firstTrack = allTracks[0];
            const firstDate = new Date(firstTrack.ts).toLocaleString();

            // Group data by artist for the chart
            const artistCounts = allTracks.reduce((acc, track) => {
                const artist = track.master_metadata_album_artist_name;
                acc[artist] = (acc[artist] || 0) + 1;
                return acc;
            }, {});

            // Update stats display
            stats.innerHTML = `
                <div class="stat-card">
                    <h3>Your First Tracked Listen</h3>
                    <p class="track-name">${firstTrack.master_metadata_track_name}</p>
                    <p class="artist-name">by ${firstTrack.master_metadata_album_artist_name}</p>
                    <p class="album-name">from ${firstTrack.master_metadata_album_album_name}</p>
                    <p class="timestamp">on ${firstDate}</p>
                </div>
                <div class="stat-card">
                    <h3>Overall Statistics</h3>
                    <p>Total Tracks: ${allTracks.length}</p>
                    <p>Unique Artists: ${Object.keys(artistCounts).length}</p>
                </div>
            `;

            // Update chart
            const ctx = document.getElementById('listeningChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(artistCounts),
                        datasets: [{
                            label: 'Tracks per Artist',
                            data: Object.values(artistCounts),
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderColor: 'rgba(255, 255, 255, 0.6)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#FFFFFF'
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: '#FFFFFF',
                                    stepSize: 1
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#FFFFFF',
                                    maxRotation: 45,
                                    minRotation: 45
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            }
                        }
                    }
                });
            }
        } else {
            stats.innerHTML = '<p>No listening data available. Please import some data first.</p>';
        }
    } catch (error) {
        console.error('Error loading listening data:', error);
        stats.innerHTML = '<p class="error">Error loading listening data: ' + error.message + '</p>';
    }
});