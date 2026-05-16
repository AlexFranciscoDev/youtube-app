const express = require('express');
const router = express.Router();
const { Readable } = require('stream');

const ALLOWED_HOSTS = ['www.instagram.com', 'instagram.com'];

router.get('/', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url required' });

    let parsed;
    try { parsed = new URL(url); } catch {
        return res.status(400).json({ error: 'invalid url' });
    }
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        return res.status(400).json({ error: 'host not allowed' });
    }

    try {
        const pageRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        if (!pageRes.ok) return res.status(502).json({ error: 'instagram fetch failed' });
        const html = await pageRes.text();

        const ogImageMatch =
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/);

        if (!ogImageMatch) return res.status(404).json({ error: 'thumbnail not found' });

        const imageUrl = ogImageMatch[1].replace(/&amp;/g, '&');

        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) return res.status(502).json({ error: 'image proxy failed' });

        res.set('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=3600');
        Readable.fromWeb(imgRes.body).pipe(res);

    } catch {
        res.status(500).json({ error: 'internal error' });
    }
});

module.exports = router;
