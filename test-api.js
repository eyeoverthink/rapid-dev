const axios = require('axios');

async function testEndpoint(url) {
    try {
        const options = {
            method: 'POST',
            url: 'https://all-media-downloader1.p.rapidapi.com/all',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-rapidapi-host': 'all-media-downloader1.p.rapidapi.com',
                'x-rapidapi-key': 'a702149265msh04679705098dcf5p1c3f4cjsn79f5457e218b'
            },
            data: new URLSearchParams({ url }).toString()
        };

        console.log('Testing URL:', url);
        const response = await axios.request(options);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return null;
    }
}

// Test a YouTube URL
const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.xvideos.com/video12345',
    'https://www.instagram.com/p/abcd1234'
];

async function runTests() {
    for (const url of testUrls) {
        console.log('\n=== Testing URL:', url, '===');
        await testEndpoint(url);
    }
}

runTests();
