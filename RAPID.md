# Universal Media Downloader

A modern web application for downloading media from various platforms with a Netflix/YouTube-inspired dark theme UI.

## Features

### Platform Support
- **Video Platforms**
  - YouTube
  - XVideos
  - XNXX
  - PornHub
  - Vimeo
  - Dailymotion
  - TikTok
  - Bilibili

- **Social Media**
  - Twitter/X
  - Instagram
  - Facebook
  - LinkedIn
  - Reddit

- **Other Platforms**
  - IMDB
  - Deezer

### Core Functionality
1. **Media Download**
   - Direct URL input
   - Auto-platform detection
   - Multiple quality options (where available)
   - Progress tracking
   - Status notifications

2. **Library Management**
   - Add downloads to library
   - View download history
   - Search through downloaded items
   - Filter by platform

3. **Search Feature**
   - Platform-specific media search
   - Search results preview
   - Direct download from search results

### UI Features
- Modern dark theme
- Responsive grid layout
- Platform selection checkboxes
- Download progress indicators
- Success/error notifications
- Library integration

## API Integration

### RapidAPI Endpoints
- `/api/download`: Main download endpoint
- `/api/library`: Library management
- `/api/search`: Media search (platform specific)
- `/api/platforms`: Get enabled platforms

### Response Format
```json
{
  "success": true,
  "data": {
    "url": "download_url",
    "title": "media_title",
    "thumbnail": "thumbnail_url",
    "quality": "media_quality",
    "duration": "media_duration",
    "platform": "source_platform"
  }
}
```

## Technical Stack
- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **Backend**: Node.js, Express
- **API**: RapidAPI Media Downloader

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```env
   RAPID_API_KEY=your_api_key
   PORT=3333
   ```

3. Run the server:
   ```bash
   node server.js
   ```

4. Access the application:
   ```
   http://localhost:3333
   ```

## Future Enhancements
- [ ] User authentication
- [ ] Download queue management
- [ ] Quality selection before download
- [ ] Batch downloads
- [ ] Download scheduling
- [ ] Browser extension integration
- [ ] Mobile app version
- [ ] Custom themes
- [ ] Offline mode support
- [ ] Download speed optimization
