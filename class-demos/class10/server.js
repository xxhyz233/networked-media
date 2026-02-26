// Backend JS file
// Import express as express variable
const express = require("express")

// Instance express as app variable
const app = express()

// setting up middeware -- settings for my server
// public holds all the front-end files (HTML, CSS, JS...)
app.use(express.static('public'))
app.set('view engine', 'ejs')

// Storing all my guests inside of a global server array,
// these variables restarts when server restarts
let guestNames = [];

// 1st parameter: location (url)
// 2nd parameter: action to perform when getting a request at a location(url)
app.get('/', (request, response) => {
    response.send('<h1>hi</h1>');
});
app.get('/ciallo', (request, response) => {
    response.send('<h1>ciallo</h1>');
});
// Redirects to /ciallo when accessing localhost:11451/cialloDirect
app.get('/cialloDirect', (request, response) => {
    response.redirect('./ciallo');
});
// Allows our server to send and render our ejs as html to the client
app.get('/guestbook', (request, response)=>{
    let dataToBeSent = {
        serverData: "Hello",
        firstGuest: guestNames[0]
    }
    // 1st param: name of the ejs file
    // 2nd param: object to be sent to the client
    response.render('guestbook.ejs', dataToBeSent)
})
app.get('/sign', (request, response)=>{
    // Get the response from HTML
    let name = request.query.guestName;
    guestNames.push(name);
    console.log(guestNames)
    response.send('Signed! ' + name)
})

app.listen(11451, () => {
    console.log("server has started.")
})