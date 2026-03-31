const express = require('express');
const nedb = require('@seald-io/nedb')

const app = express()
const database = new nedb({filename: 'myGO.txt', autoload: true});

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', (request, response) => {
    response.send('<h1>Server might be</h1>')
})

app.get('/api/entire-database', (err, foundData) => {
    if(err){
        response.send('Error in receiving data')
    }
    else {
        response.json(foundData)
    }
})

app.post('/makePost', (request, response) => {

    let dataToBeAdded = {
        note: request.body.note
    }
    database.insert(dataToBeAdded)

    response.redirect("/post.html")
})

app.listen(11451, () => {
    console.log('Goon')
})