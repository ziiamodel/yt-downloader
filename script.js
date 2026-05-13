document.addEventListener('DOMContentLoaded', function() {
    const getInfoBtn = document.getElementById('getInfoBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrlInput = document.getElementById('videoUrl');
    const videoInfo = document.getElementById('videoInfo');
    const progressContainer = document.getElementById
const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    getInfoBtn.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            alert('Please enter a YouTube URL');
            return;
        }

        try {
            getInfoBtn.disabled = true;
            getInfoBtn.textContent = 'Loading...';
            
            // Using a public API for YouTube video info
            const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display video info
            document.getElementById('thumbnail').src = data.thumbnail_url;
            document.getElementById('title').textContent = data.title;
            document.getElementById('duration').textContent = `Author: ${data.author_name}`;
            
            // Populate format options (simplified for frontend-only version)
            const formatSelect = document.getElementById('formatSelect');
            formatSelect.innerHTML = '';
            
            // Common quality options
            const qualities = [
                { id: 'best', label: 'Best Quality' },
                { id: 'worst', label: 'Lowest Quality (Faster)' },
                { id: 'best[height<=720]', label: '720p or lower' },
                { id: 'best[height<=480]', label: '480p or lower' },
                { id: 'bestaudio', label: 'Audio Only' }
            ];
            
            qualities.forEach(quality => {
                const option = document.createElement('option');
                option.value = quality.id;
                option.textContent = quality.label;
                formatSelect.appendChild(option);
            });
            
            videoInfo.style.display = 'block';
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            getInfoBtn.disabled = false;
            getInfoBtn.textContent = 'Get Video Info';
        }
    });

    downloadBtn.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();
        const formatId = document.getElementById('formatSelect').value;
        
        if (!url) {
            alert('Please enter a YouTube URL');
            return;
        }
        
        try {
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'Preparing download...';
            progressContainer.style.display = 'block';
            
            // Using a third-party download service
            // Note: This is a simplified approach and may have limitations
            const downloadUrl = `https://ytdownload.org/api/button/mp3/${encodeURIComponent(url)}`;
            
            // Create a temporary link to trigger the download
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.target = '_blank'; // Open in new tab for external service
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Update UI
            progressBar.style.width = '100%';
            progressText.textContent = 'Download started in a new tab';
            
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '';
            }, 3000);
            
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.textContent = 'Download';
        }
    });
});
