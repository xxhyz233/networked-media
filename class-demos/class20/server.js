const express = require('express')
const nedb = require('@seald-io/nedb')

const app = express();
const database = new nedb({
    filename: 'data.txt',
    autoload: true
})

app.use(express.static('public'))
app.use(express.json())

app.get('api/retrieve', (request, response) => {
    database.find({}, (err, foundData)=>{
        response.json(foundData)
    })
})

app.post('api/add', (request, response) => {
    console.log(request.body)
    let dataToBeAdded = {
        content: undefined
    }
    database.insert(dataToBeAdded, (err, insertedData)=> {
        response.sendStatus(204)
    })
})

app.listen(11451, ()=>{
    console.log('App is running at http://localhost:11451')
})