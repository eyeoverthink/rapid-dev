const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3333;

app.use(cors());
app.use(express.json());

// Platform-specific configuration
const PLATFORMS = {
    youtube: {
        name: 'YouTube',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['youtube.com', 'youtu.be']
    },
    xnxx: {
        name: 'XNXX',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['xnxx.com']
    },
    xvideos: {
        name: 'XVideos',
        enabled: true,
        endpoint: 'all',
        search: true,
        searchEndpoint: 'xvideo-search',
        domains: ['xvideos.com']
    },
    pornhub: {
        name: 'PornHub',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['pornhub.com']
    },
    twitter: {
        name: 'Twitter',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['twitter.com', 'x.com']
    },
    instagram: {
        name: 'Instagram',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['instagram.com']
    },
    facebook: {
        name: 'Facebook',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['facebook.com', 'fb.com']
    },
    vimeo: {
        name: 'Vimeo',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['vimeo.com']
    },
    dailymotion: {
        name: 'Dailymotion',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['dailymotion.com']
    },
    reddit: {
        name: 'Reddit',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['reddit.com']
    },
    tiktok: {
        name: 'TikTok',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['tiktok.com']
    },
    linkedin: {
        name: 'LinkedIn',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['linkedin.com']
    },
    imdb: {
        name: 'IMDB',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['imdb.com']
    },
    deezer: {
        name: 'Deezer',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['deezer.com']
    },
    bilibili: {
        name: 'Bilibili',
        enabled: true,
        endpoint: 'all',
        search: false,
        domains: ['bilibili.com']
    }
};

// Helper function to detect platform from URL
function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    for (const [platform, config] of Object.entries(PLATFORMS)) {
        if (config.enabled && config.domains.some(domain => urlLower.includes(domain))) {
            return platform;
        }
    }
    return 'default';
}

// Helper function to make API requests
async function makeApiRequest(url, platform = 'default') {
    const API_KEY = process.env.RAPID_API_KEY || 'a702149265msh04679705098dcf5p1c3f4cjsn79f5457e218b';
    const API_HOST = 'all-media-downloader1.p.rapidapi.com';

    const options = {
        method: 'POST',
        url: `https://${API_HOST}/${platform === 'default' ? 'all' : platform}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-rapidapi-host': API_HOST,
            'x-rapidapi-key': API_KEY
        },
        data: new URLSearchParams({ url }).toString()
    };

    try {
        console.log(`Making API request for ${platform}:`, url);
        const response = await axios.request(options);
        
        if (!response.data || !response.data.url) {
            console.log('Invalid API response:', response.data);
            throw new Error('Failed to get download URL from API');
        }

        // Clean up the response data
        return {
            url: response.data.url,
            title: response.data.title || response.data.meta?.title || 'Untitled',
            thumbnail: response.data.thumb || response.data.thumbnail || response.data.thumbnailUrl || '',
            duration: response.data.duration || response.data.meta?.duration || '',
            quality: response.data.quality || response.data.format || 'Unknown'
        };
    } catch (error) {
        console.error(`Error making API request for ${platform}:`, error.message);
        if (platform !== 'default') {
            console.log(`Retrying with default endpoint for ${platform} URL:`, url);
            return makeApiRequest(url, 'default');
        }
        throw new Error(`Failed to download media: ${error.message}`);
    }
}

// In-memory library storage (in production this would be a database)
let libraryItems = [];
let nextItemId = 1;

// Library endpoints
app.get('/api/library', (req, res) => {
    try {
        const { search, platform } = req.query;
        let filteredItems = [...libraryItems];

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filteredItems = filteredItems.filter(item => 
                item.title.toLowerCase().includes(searchLower)
            );
        }

        // Apply platform filter
        if (platform) {
            filteredItems = filteredItems.filter(item => 
                item.platform === platform
            );
        }

        // Sort by most recently added
        filteredItems.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );

        res.json({ success: true, items: filteredItems });
    } catch (error) {
        console.error('Error getting library items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/library/add', (req, res) => {
    try {
        const { url, title, thumbnail, duration, platform } = req.body;
        if (!url || !title || !platform) {
            return res.status(400).json({
                success: false,
                error: 'URL, title, and platform are required'
            });
        }

        const item = {
            id: String(nextItemId++),
            url,
            title,
            thumbnail,
            duration,
            platform,
            addedAt: new Date().toISOString()
        };

        libraryItems.push(item);
        res.json({ success: true, item });
    } catch (error) {
        console.error('Error adding to library:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/library/delete', (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                error: 'Item IDs array is required'
            });
        }

        libraryItems = libraryItems.filter(item => !ids.includes(item.id));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting from library:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { platform, query } = req.body;
        if (!platform || !query) {
            return res.status(400).json({ 
                success: false, 
                error: 'Platform and query are required' 
            });
        }

        const platformConfig = PLATFORMS[platform];
        if (!platformConfig || !platformConfig.search) {
            return res.status(400).json({ 
                success: false, 
                error: `Search not supported for ${platform}` 
            });
        }

        const endpoint = platformConfig.searchEndpoint;
        console.log(`Searching ${platform} with query:`, query);

        const API_KEY = 'a702149265msh04679705098dcf5p1c3f4cjsn79f5457e218b';
        const API_HOST = 'all-media-downloader1.p.rapidapi.com';

        const options = {
            method: 'POST',
            url: `https://${API_HOST}/${endpoint}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-rapidapi-host': API_HOST,
                'x-rapidapi-key': API_KEY
            },
            data: new URLSearchParams({ query }).toString()
        };

        const response = await axios.request(options);
        console.log('Search Response:', JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.results) {
            throw new Error('Invalid search response');
        }

        res.json({
            success: true,
            results: response.data.results.map(item => ({
                title: item.title || item.name,
                url: item.url || item.link,
                thumbnail: item.thumbnail || item.image,
                duration: item.duration || ''
            }))
        });
    } catch (error) {
        console.error('Search Error:', error.message);
        if (error.response) {
            console.error('Error Response:', error.response.data);
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Main download endpoint
app.post('/api/download', async (req, res) => {
    try {
        const { url, addToLibrary } = req.body;
        if (!url) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL is required' 
            });
        }

        const platform = detectPlatform(url);
        console.log('Detected platform:', platform);
        
        const data = await makeApiRequest(url, platform);
        console.log('API response:', data);

        // If requested, add to library
        if (addToLibrary && data.url) {
            const item = {
                id: String(nextItemId++),
                url: data.url,
                title: data.title,
                thumbnail: data.thumbnail,
                duration: data.duration,
                platform,
                addedAt: new Date().toISOString()
            };
            libraryItems.push(item);
            console.log('Added to library:', item);
        }

        res.json({
            success: true,
            data: {
                url: data.url,
                title: data.title,
                thumbnail: data.thumbnail,
                quality: data.quality,
                duration: data.duration,
                platform
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            platform: detectPlatform(req.body.url || '')
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Get enabled platforms endpoint
app.get('/api/platforms', (req, res) => {
    const enabledPlatforms = Object.entries(PLATFORMS)
        .filter(([_, config]) => config.enabled)
        .map(([id, config]) => ({
            id,
            name: config.name,
            search: config.search
        }));
    res.json({ success: true, platforms: enabledPlatforms });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/library', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'library.html'));
});

app.get('/podcasts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'podcasts.html'));
});

app.get('/videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videos.html'));
});

app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'books.html'));
});

app.get('/downloads', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'downloads.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/video-creation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video-creation.html'));
});

// Socket.io event handlers
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Add user to connected users
    connectedUsers.set(socket.id, {
        id: socket.id,
        name: `User ${socket.id.slice(0, 6)}`,
        status: 'online'
    });

    // Broadcast updated user list to all clients
    io.emit('users-updated', Array.from(connectedUsers.values()));

    // Handle chat messages
    socket.on('send-message', (message) => {
        io.emit('new-message', {
            userId: socket.id,
            message,
            timestamp: new Date()
        });
    });

    // Handle media playback events
    socket.on('play', (mediaId) => {
        socket.broadcast.emit('media-played', { mediaId, userId: socket.id });
    });

    socket.on('pause', (mediaId) => {
        socket.broadcast.emit('media-paused', { mediaId, userId: socket.id });
    });

    // Handle social interactions
    socket.on('like-media', (mediaId) => {
        io.emit('media-liked', { mediaId, userId: socket.id });
    });

    socket.on('share-media', (mediaId) => {
        socket.broadcast.emit('media-shared', { mediaId, userId: socket.id });
    });

    // Handle user status changes
    socket.on('set-status', (status) => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            user.status = status;
            io.emit('users-updated', Array.from(connectedUsers.values()));
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        connectedUsers.delete(socket.id);
        io.emit('users-updated', Array.from(connectedUsers.values()));
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
