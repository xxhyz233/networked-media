// imports the dotenv library
// and allows us to access variables inside .env file
// by using process.env.VARIABLE_NAME
require('dotenv').config();
// importing the masto api that we will use
const m = require('masto');
const jsdom = require('jsdom')

// setup the ability to use the masto library
// this is very similar to making app
// const app = express()
const masto = m.createRestAPIClient({
	url: 'https://networked-media.itp.io',
	accessToken: process.env.TOKEN,
});

const stream = m.createStreamingAPIClient({
	accessToken: process.env.TOKEN,
	streamingApiUrl: 'wss://networked-media.itp.io'
})

const reply = async () => {
	const notification = await stream.user.notification.subscribe()

	for await(let notif of notification) {
		// console.log(notif.payload)
		let type = notif.payload.type
		// Filtering for mention @ notifications
		if (type=="mention") {
			// Parse HTML content as if we're using frontend JS
			const input = new jsdom.JSDOM(notif.payload.status.content)
			const text = input.window.document.querySelector('p').textContent

			console.log(text)
			console.log(input)

			// make a request to store info to my server
			await fetch('http://localhost:11451/api/add', {
				method: "POST",
				body: JSON.stringify({content: text}),
				header: {
					'Content-Type': 'application/json',
				}
			})
		}
	}
}

reply();

// function makeStatus(){}
const makeStatus = async () => {
	// customize the text output to be random when we run the function
	let emojis = ['🫡', '💖', '🎉', '🤠'];
	// this grabs a random index between 0 - emoji.length
	// this number needs to be a whole number
	let randomSelection = Math.floor(Math.random() * emojis.length);

	const s = await masto.v1.statuses.create({
		status: emojis[randomSelection],
		visibility: 'private',
	});
	console.log(s.url);
};

// will post one status one time
// makeStatus();
// will post a status one time every 10 seconds
// setInterval(makeStatus, 10000);
