const express = require('express')
const multer = require('multer')
const geoip = require('geoip-lite');

const app = express()
const upload = multer({
    dest: 'public/uploads'
})

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true}))
app.set('view engine', 'ejs')
app.set('trust proxy', true)

const posts = [
    
];

app.get('/project3/', (request, response) => {
    response.render('index.ejs', { clientPosts: posts });
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
        posts.push({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            ip,
            location
        });
    }
    response.redirect('/project3/#join');
})

app.listen(11451, () => {
    console.log('hello')
})