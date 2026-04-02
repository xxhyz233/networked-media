// importing .env file
require('dotenv').config();
// Importing the masto api
const m = require('masto')

// Enables the client to get to the Mastodon server, the TOKEN enables read/write permissions
const masto = m.createRestAPIClient({
    url: 'https://networked-media.itp.io',
    accessToken: process.env.TOKEN
})

const makeStatus = async () => {
    let emojis = ['🐽', '🐷', '🩷', '😀']
    let randIndex = Math.floor(Math.random()*emojis.length);
    let randEmoji = emojis[randIndex]
    // Create a new status (post) from the masto v1 bot
    const s = await masto.v1.statuses.create({
        status: randEmoji,
        visibility: 'public'
    })
    console.log(s.url)
}
// Make a post
// makeStatus()

setInterval(makeStatus, 10000)