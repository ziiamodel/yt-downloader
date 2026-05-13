const express = require('express');
const path = require('path');
const cors = require('cors');
const YtdlpWrap = require('yt-dlp-wrap').default;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// API route to get video info
app.post('/api/info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        const ytDlpWrap = new YtdlpWrap();
        
        // Get video info
        const videoInfo = await ytDlpWrap.getVideoInfo(url);
        
        // Extract relevant information
        const formats = videoInfo.formats
            .filter(format => format.vcodec !== 'none' && format.acodec !== 'none')
            .map(format => ({
                formatId: format.format_id,
                quality: format.quality || `${format.height}p`,
                container: format.ext,
                fileSize: format.filesize ? `${(format.filesize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
            }));
        
        // Get the best thumbnail
        const thumbnail = videoInfo.thumbnail || (videoInfo.thumbnails && videoInfo.thumbnails.length > 0 
            ? videoInfo.thumbnails[videoInfo.thumbnails.length - 1].url 
            : '');
        
        // Format duration
        const duration = videoInfo.duration ? 
            `${Math.floor(videoInfo.duration / 60)}:${Math.floor(videoInfo.duration % 60).toString().padStart(2, '0')}` : 
            'Unknown';
        
        res.json({
            title: videoInfo.title,
            thumbnail,
            duration,
            formats
        });
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ error: 'Failed to get video info. Please check the URL and try again.' });
    }
});

// API route to download video
app.post('/api/download', async (req, res) => {
    try {
        const { url, formatId } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        const ytDlpWrap = new YtdlpWrap();
        
        // Set response headers for file download
        const videoInfo = await ytDlpWrap.getVideoInfo(url);
        const fileName = `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp4`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'video/mp4');
        
        // Start the download process
        const ytDlpEventEmitter = ytDlpWrap
            .exec([url, '-f', formatId || 'best', '-o', '-'])
            .on('progress', (progress) => {
                const percent = progress.percent ? progress.percent.toFixed(2) : 0;
                const speed = progress.currentDownloadSpeed ? progress.currentDownloadSpeed : 'Unknown';
                console.log(`Download progress: ${percent}% | Speed: ${speed}`);
            })
            .on('error', (error) => {
                console.error('Download error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Download failed. Please try again.' });
                }
            });
        
        // Pipe the download stream to the response
        ytDlpEventEmitter.pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download video. Please try again.' });
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
