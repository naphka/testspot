document.addEventListener('DOMContentLoaded', async () => {
    const dataManager = new DataManager();
    const stats = document.getElementById('stats');
    
    // Create container for chart controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'chart-controls';
    controlsContainer.innerHTML = `
        <button id="viewToggle" class="chart-toggle-btn">Show Cumulative View</button>
    `;
    document.querySelector('.chart-container').appendChild(controlsContainer);

    // Create canvas for the chart
    const timeChartCanvas = document.createElement('canvas');
    timeChartCanvas.id = 'timeChart';
    document.querySelector('.chart-container').appendChild(timeChartCanvas);

    let timeChart = null;
    let monthlyListening = {};
    let allTracks = [];

    try {
        const files = await dataManager.getAllFiles();
        console.log('Files loaded:', files);

        // Combine all listening data from all files
        files.forEach(file => {
            if (file.data?.content) {
                allTracks = allTracks.concat(file.data.content);
            }
        });

        if (allTracks.length > 0) {
            // Sort tracks by timestamp
            allTracks.sort((a, b) => new Date(a.ts) - new Date(b.ts));

            // Group data by month
            monthlyListening = allTracks.reduce((acc, track) => {
                const date = new Date(track.ts);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!acc[monthKey]) {
                    acc[monthKey] = 0;
                }
                acc[monthKey] += track.ms_played / (1000 * 60 * 60); // Convert to hours
                return acc;
            }, {});

            // Function to update chart
            const updateChart = (cumulative = false) => {
                const labels = Object.keys(monthlyListening);
                let data = Object.values(monthlyListening);

                if (cumulative) {
                    data = data.reduce((acc, curr, i) => {
                        acc.push((acc[i-1] || 0) + curr);
                        return acc;
                    }, []);
                }

                if (timeChart) {
                    timeChart.destroy();
                }

                timeChart = new Chart(timeChartCanvas, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: cumulative ? 'Cumulative Listening Time (Hours)' : 'Monthly Listening Time (Hours)',
                            data: data,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#FFFFFF'
                                }
                            },
                            title: {
                                display: true,
                                text: cumulative ? 'Cumulative Listening Time Evolution' : 'Monthly Listening Time Evolution',
                                color: '#FFFFFF',
                                font: {
                                    size: 16
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#FFFFFF',
                                    maxRotation: 45,
                                    minRotation: 45
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#FFFFFF'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                title: {
                                    display: true,
                                    text: 'Hours',
                                    color: '#FFFFFF'
                                }
                            }
                        }
                    }
                });
            };

            // Initial chart render
            updateChart(false);

            // Add toggle button functionality
            document.getElementById('viewToggle').addEventListener('click', (e) => {
                const isCumulative = e.target.textContent.includes('Show Monthly');
                e.target.textContent = isCumulative ? 'Show Cumulative View' : 'Show Monthly View';
                updateChart(isCumulative);
            });

            // Calculate total listening time
            const totalHours = allTracks.reduce((acc, track) => acc + track.ms_played / (1000 * 60 * 60), 0);
            
            // Update stats display
            stats.innerHTML = `
                <div class="stat-card">
                    <h3>Your First Tracked Listen</h3>
                    <p class="track-name">${allTracks[0].master_metadata_track_name}</p>
                    <p class="artist-name">by ${allTracks[0].master_metadata_album_artist_name}</p>
                    <p class="album-name">from ${allTracks[0].master_metadata_album_album_name}</p>
                    <p class="timestamp">on ${new Date(allTracks[0].ts).toLocaleString()}</p>
                </div>
                <div class="stat-card">
                    <h3>Overall Statistics</h3>
                    <p>Total Tracks: ${allTracks.length}</p>
                    <p>Total Listening Time: ${totalHours.toFixed(1)} hours</p>
                    <p>Average Daily Listening: ${(totalHours / (allTracks.length > 0 ? 
                        (new Date(allTracks[allTracks.length-1].ts) - new Date(allTracks[0].ts)) / (1000 * 60 * 60 * 24) : 1)
                    ).toFixed(1)} hours</p>
                </div>
            `;
        } else {
            stats.innerHTML = '<p>No listening data available. Please import some data first.</p>';
        }
    } catch (error) {
        console.error('Error loading listening data:', error);
        stats.innerHTML = '<p class="error">Error loading listening data: ' + error.message + '</p>';
    }
});