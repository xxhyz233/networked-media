// npm install multer @seald-io/nedb cookie-parser

const express = require('express')
const multer = require('multer')
const nedb = require('@seald-io/nedb')
const cookieParser = require('cookie-parser')

const app = express()
const upload = multer({
    dest: 'public/uploads'
})
const database = new nedb({
    filename: "database.txt",
    autoload: true
})

app.use(express.static('public'))   // Allows front-end assets
app.use(express.urlencoded({extended: true}))   // Allows request.body
app.use(cookieParser())     // Allows request.cookies
app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
    let totalVisits = 0;
    // 30 days in the future
    let expireDate = Date.now() + 30 * 24 * 60 * 60 * 1000
    res.cookie('visits', totalVisits, { expires: new Date(expireDate)})
    res.render('index.ejs', {serverVisitCount: totalVisits})
})

app.listen(8080, () => {
    console.log('server is running')
})