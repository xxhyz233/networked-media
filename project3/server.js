const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const geoip = require('geoip-lite');

const app = express()
const upload = multer({
    dest: 'public/uploads'
})

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true}))
app.set('view engine', 'ejs')
app.set('trust proxy', true)

const POSTS_FILE = path.join(__dirname, 'posts.json')

function loadPosts() {
    if (!fs.existsSync(POSTS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function savePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

app.get('/project3/', (request, response) => {
    response.render('index.ejs', { clientPosts: loadPosts() });
})

app.post('/submit', (request, response) => {
    const { name, email, message } = request.body;
    if (name && email && message) {
        const rawIp = (request.headers['x-forwarded-for'] || request.socket.remoteAddress || '').split(',')[0].trim();
        // IPv6 address
        const ip = rawIp.replace(/^::ffff:/, '');
        const isLocal = ip === '::1' || ip === '127.0.0.1';
        const geo = isLocal ? null : geoip.lookup(ip);
        const location = geo
            ? [geo.city, geo.country].filter(Boolean).join(', ')
            : isLocal ? 'local' : null;
        const posts = loadPosts();
        posts.push({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            ip,
            location
        });
        savePosts(posts);
    }
    response.redirect('/#join');
})

app.listen(11451, () => {})