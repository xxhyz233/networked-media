const express = require('express')

const app = express()

app.use(express.static('public'))

app.get('/', (request, response) => {
    response.send('<h1>hi</h1>');
})

app.get('/api/messages', (request, response) => {
    // Sends a json file with API
    response.json( { testData: 'Hi'})
})

app.listen(4001, () => {
    console.log('app is running on port 4001')
})