// npm install express multer @seald-io/nedb cookie-parser express-session nedb-promises-session-store bcrypt

const express = require('express')
const multer = require('multer')
const nedb = require('@seald-io/nedb')
const cookieParser = require('cookie-parser')

const expressSession = require('express-session')
const nedbSession = require('nedb-promises-session-store')
const bcrypt = require('bcrypt')

const app = express();
const upload = multer({
    dest: "public/uploads"
})
let database = new nedb({
    filename: "database.txt",
    autoload: true
})

const nedbSessionInit = nedbSession({
    connect: expressSession,
    filename: 'sessions.txt'
})

const userdb = new nedb({
    filename: 'userdb.txt',
    autoload: true
})

// middleware
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(expressSession({
    store: nedbSessionInit,
    cookie: {
        maxAge: 1000 * 60 * 60 * 60 * 24 * 365
    },
    secret: '114514'
}))

app.get('/login-page', (request, response)=>{
    response.render('login.ejs')
})

app.get('/signup-page', (request, response)=>{
    response.render('signup.ejs')
})

app.post('/register', (request, response)=>{
    // Encrypts the password, then store the username and password to nedb
    let encryptedPassword = bcrypt.hashSync(request.body.pass, 10)
    let userToBeAdded = {
        username: request.body.username,
        password: encryptedPassword
    }
    userdb.insert(userToBeAdded, (err, insertedUser)=>{
        response.redirect('/login')
    })
})

app.post('/authenticate', (request, response)=>{
    let searchedUser = {
        username: request.body.username
    }
    // Find the user from our user database
    userdb.findOne(searchedUser, (err, foundUser)=>{
        // Redirect when user is not found
        if (foundUser == null || err) {
            console.log('username not found')
            response.redirect('/login-page?user=null')
        }
        else {
            // Check if the username and password match
            if(bcrypt.compareSync(request.body.pass, foundUser.password)){
                let session = request.session
                session.loggedInUser = foundUser.username
                response.redirect('/')
            }
            else {
                response.redirect('/login-page?password=invvalid')
            }
        }
    })
})

app.listen(11451, ()=>{
    console.log('server has started')
})