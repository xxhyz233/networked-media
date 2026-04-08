// imports the dotenv library
// and allows us to access variables inside .env file
// by using process.env.VARIABLE_NAME
require('dotenv').config();
// importing the masto api that we will use
const m = require('masto');
const axios = require('axios');
const cheerio = require('cheerio');

// setup the ability to use the masto library
// this is very similar to making app
// const app = express()
const masto = m.createRestAPIClient({
	url: 'https://networked-media.itp.io',
	accessToken: process.env.TOKEN,
});

const stream = m.createStreamingAPIClient({
	accessToken: process.env.TOKEN,
	streamingApiUrl: 'wss://networked-media.itp.io', // special url we use for sockets
});

// create axios instance with proper headers for Wikipedia
const wikiAxios = axios.create({
	baseURL: 'https://en.wikipedia.org/w/api.php',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
	},
	timeout: 10000
});

// create axios instance for local server
const serverAxios = axios.create({
	baseURL: 'http://localhost:11451'
});

// 30 mins
const JUMP_INTERVAL = 30 * 60 * 1000;
const MAX_POSTS_PER_DAY = 50;

class WikipediaJumpBot {
	constructor() {
		this.currentPage = null;
		this.currentLinks = [];
		this.journeyPath = [];
		this.jumpCount = 0;
		this.postsToday = 0;
		this.lastResetDate = new Date().toDateString();
	}

    // extract all Wikipedia links from parsed HTML
	extractLinksFromHtml(html, currentTitle) {
		const $ = cheerio.load(html);
		const links = new Set();

		// Only look for links that points to Wikipedia
		$('a[href]').each((i, elem) => {
			let href = $(elem).attr('href');
			
			// Look for /wiki/ links
			const match = href.match(/\/wiki\/([^#?]+)/);
			if (match) {
				const articleName = decodeURIComponent(match[1]);
				// Filter out special pages and avoid loops
				if (
					!articleName.includes(':') &&
					articleName !== currentTitle &&
					!articleName.startsWith('Special:') &&
					!articleName.startsWith('File:') &&
					!articleName.startsWith('Template:') &&
					!articleName.startsWith('Help:') &&
					!articleName.startsWith('Category:') &&
					articleName.length > 0
				) {
					links.add(articleName);
				}
			}
		});

		return Array.from(links);
	}

	// grab a random Wikipedia page
	async getRandomPage() {
		try {
			const response = await wikiAxios.get('', {
				params: {
					action: 'query',
					format: 'json',
					list: 'random',
					rnnamespace: 0
				}
			});
			const randomPages = response.data.query.random;
			return randomPages[0].title;
		} catch (error) {
			console.error(`Can't get random page: ${error.message}`);
			throw error;
		}
	}

  	// fetcj a Wikipedia page and extract its links
	async fetchPage(pageTitle) {
		try {
			console.log(`Fetching: ${pageTitle}`);
			
			// get full HTML content
			const response = await wikiAxios.get('', {
				params: {
					action: 'parse',
					format: 'json',
					page: pageTitle,
					prop: 'text',
					disableeditsection: true
				}
			});

			if (!response.data.parse) {
				console.log(`Page not found: ${pageTitle}`);
				return false;
			}

			this.currentPage = response.data.parse.title;
			const html = response.data.parse.text['*'];
			
			if (!html) {
				console.log(`No content found for: ${this.currentPage}`);
				return false;
			}

			this.currentLinks = this.extractLinksFromHtml(html, this.currentPage);
			
			console.log(`Successfully fetched "${this.currentPage}"`);
			console.log(`Found ${this.currentLinks.length} links on this page`);
			
			if (this.currentLinks.length === 0) {
				console.log('No extractable links found on this page!');
				return false;
			}
			
			return true;
		} catch (error) {
			console.error(`Error fetching page: ${error.message}`);
			return false;
		}
	}

	// check daily post limits 
	checkDailyLimit() {
		const today = new Date().toDateString();
		if (today !== this.lastResetDate) {
			this.postsToday = 0;
			this.lastResetDate = today;
		}
		return this.postsToday < MAX_POSTS_PER_DAY;
	}

	// store jump information to database
	async storeJumpData(fromPage, toPage) {
		try {
			const journeyText = this.journeyPath.join(' -> ');
			await serverAxios.post('/api/add', {
				content: `Jumped from ${fromPage} to ${toPage}`,
				fromPage: fromPage,
				toPage: toPage,
				journeyPath: journeyText,
				jumpCount: this.jumpCount
			});
			console.log(`Stored jump data to database: ${fromPage} -> ${toPage}`);
			return true;
		} catch (error) {
			console.error(`Error storing jump data: ${error.message}`);
			return false;
		}
	}

	// post status to Mastodon
	async postStatus(content) {
		// check daily post limit
		if (!this.checkDailyLimit()) {
			console.log(`Daily post limit reached (${MAX_POSTS_PER_DAY} posts). No post sent.`);
			return false;
		}

		try {
			// Add hashtag to content
			const statusWithHashtag = `${content} #abot`;
			const s = await masto.v1.statuses.create({
				status: statusWithHashtag,
				visibility: 'public',
			});
			this.postsToday++;
			console.log(`Posted to Mastodon: ${s.url} (${this.postsToday}/${MAX_POSTS_PER_DAY} posts today)`);
			return true;
		} catch (error) {
			console.error(`Error posting to Mastodon: ${error.message}`);
			return false;
		}
	}

	// Pick a random link to jump to from the parsed HTML
	async jumpToRandomLink() {
		if (this.currentLinks.length === 0) {
			console.log('No more links, starting a new random page.');
			return await this.startNewJourney();
		}

		const randomIndex = Math.floor(Math.random() * this.currentLinks.length);
		const nextPage = this.currentLinks[randomIndex];
		
		this.journeyPath.push(this.currentPage);
		console.log(`Jumping from "${this.currentPage}" to "${nextPage}"`);
		console.log(`Journey so far: ${this.journeyPath.join(' -> ')} -> ${nextPage}`);
		
		this.jumpCount++;
		console.log(`Total jumps made: ${this.jumpCount}`);
		
		// Store jump data to database
		await this.storeJumpData(this.currentPage, nextPage);
		
		// Post the jump to Mastodon (if under daily limit)
		if (this.checkDailyLimit()) {
			const journeyText = this.journeyPath.slice(-3).join(' -> ') + ' -> ' + nextPage;
			await this.postStatus(`Wiki Jump ${this.jumpCount}: ${journeyText}`);
		} else {
			console.log('Daily post limit reached, not posting anymore.');
		}
		
		const success = await this.fetchPage(nextPage);
		
		if (!success) {
			// If fetch failed, try to start a new journey
			return await this.startNewJourney();
		}
		
		return true;
	}

	// Start a new journey with random starting page
	async startNewJourney() {
		console.log('Starting new journey...');
		this.journeyPath = [];
		
		try {
			// grab a random article from Wikipedia
			const randomPage = await this.getRandomPage();
			const success = await this.fetchPage(randomPage);
			if (success) {
				// Store new journey start to database
				await serverAxios.post('/api/add', {
					content: `New Wiki Jump started: ${this.currentPage}`,
					fromPage: 'START',
					toPage: this.currentPage,
					journeyPath: this.currentPage,
					jumpCount: 0
				});
				await this.postStatus(`New Wiki Jump started: ${this.currentPage}`);
			}
			return success;
		} catch (error) {
			console.error(`Error starting new journey: ${error.message}`);
			// fallback to the Bread page
			console.log('Falling back to "Bread" as starting page...');
			const success = await this.fetchPage('Bread');
			if (success) {
				// Store fallback start to database
				await serverAxios.post('/api/add', {
					content: `New Wiki Jump started (fallback): ${this.currentPage}`,
					fromPage: 'FALLBACK',
					toPage: this.currentPage,
					journeyPath: this.currentPage,
					jumpCount: 0
				});
				await this.postStatus(`New Wiki Jump started: ${this.currentPage}`);
			}
			return success;
		}
	}

	// Start the bot
	async start() {
		console.log('Wikipedia Bot started!');
		console.log(`Jump interval: ${JUMP_INTERVAL / 60000} minutes\n`);
		
		// Start with initial page
		const success = await this.startNewJourney();
		
		if (!success) {
			console.error('Failed to start bot');
			process.exit(1);
		}
		
		// Set up the jumping cycle
		setInterval(async () => {
			await this.jumpToRandomLink();
		}, JUMP_INTERVAL);
	}
}

// Initialize and start the bot
const bot = new WikipediaJumpBot();
bot.start();
