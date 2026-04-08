const wikipedia = require('wikipedia');
const cheerio = require('cheerio');

// Configuration
const JUMP_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
const MIN_LINKS_FOR_JUMP = 1;

class WikipediaJumpBot {
  constructor() {
    this.currentPage = null;
    this.currentLinks = [];
    this.journeyPath = [];
    this.jumpCount = 0;
  }

  /**
   * Extract all Wikipedia article links from the page content
   */
  extractLinksFromPage(html, pageTitle) {
    const $ = cheerio.load(html);
    const links = new Set();

    // Find all links in the main content
    $('#mw-content-text a[href^="/wiki/"]').each((i, elem) => {
      let href = $(elem).attr('href');
      // Extract article name from /wiki/Article_Name
      const match = href.match(/\/wiki\/([^#?]+)/);
      if (match) {
        const articleName = decodeURIComponent(match[1]);
        // Filter out special pages and avoid linking back to current page
        if (
          !articleName.includes(':') &&
          articleName !== pageTitle &&
          !articleName.startsWith('Special:') &&
          !articleName.startsWith('File:') &&
          !articleName.startsWith('Template:')
        ) {
          links.add(articleName);
        }
      }
    });

    return Array.from(links);
  }

  /**
   * Fetch a Wikipedia page and extract its links
   */
  async fetchPage(pageTitle) {
    try {
      console.log(`\n🔍 Fetching: ${pageTitle}`);
      
      const page = await wikipedia.page(pageTitle);
      const html = await page.html();
      
      this.currentPage = page.title;
      this.currentLinks = this.extractLinksFromPage(html, page.title);
      
      console.log(`✅ Successfully fetched "${this.currentPage}"`);
      console.log(`📊 Found ${this.currentLinks.length} links on this page`);
      
      if (this.currentLinks.length === 0) {
        console.log('⚠️  No links found on this page!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Error fetching page: ${error.message}`);
      return false;
    }
  }

  /**
   * Pick a random link and jump to it
   */
  async jumpToRandomLink() {
    if (this.currentLinks.length === 0) {
      console.log('🚫 Dead end reached! No links available. Starting fresh...');
      return await this.startNewJourney();
    }

    const randomIndex = Math.floor(Math.random() * this.currentLinks.length);
    const nextPage = this.currentLinks[randomIndex];
    
    this.journeyPath.push(this.currentPage);
    console.log(`\n⏭️  Jumping from "${this.currentPage}" → "${nextPage}"`);
    console.log(`📍 Journey so far: ${this.journeyPath.join(' → ')} → ${nextPage}`);
    
    this.jumpCount++;
    console.log(`🎯 Total jumps made: ${this.jumpCount}`);
    
    const success = await this.fetchPage(nextPage);
    
    if (!success) {
      // If fetch failed, try to start a new journey
      return await this.startNewJourney();
    }
    
    return true;
  }

  /**
   * Start a brand new journey with a random starting page
   */
  async startNewJourney() {
    console.log('\n🌟 Starting new journey...');
    this.journeyPath = [];
    
    try {
      // Get a random article from Wikipedia
      const randomPage = await wikipedia.random(1);
      return await this.fetchPage(randomPage[0]);
    } catch (error) {
      console.error(`❌ Error getting random page: ${error.message}`);
      // Fallback to a known page
      console.log('⚙️  Falling back to "Bread" as starting page...');
      return await this.fetchPage('Bread');
    }
  }

  /**
   * Initialize the bot and start the jumping cycle
   */
  async start() {
    console.log('🤖 Wikipedia Link Jumping Bot started!');
    console.log(`⏱️  Jump interval: ${JUMP_INTERVAL / 60000} minutes\n`);
    
    // Start with initial page
    const success = await this.startNewJourney();
    
    if (!success) {
      console.error('Failed to initialize bot');
      process.exit(1);
    }
    
    // Set up the jumping cycle
    setInterval(async () => {
      await this.jumpToRandomLink();
    }, JUMP_INTERVAL);
    
    console.log('\n✨ Bot is now running. It will jump to a new link every 30 minutes.');
    console.log('Press Ctrl+C to stop the bot.\n');
  }
}

// Initialize and start the bot
const bot = new WikipediaJumpBot();
bot.start();
