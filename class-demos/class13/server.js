// how do we know this is a npm project?
// A: There's package.json
// what command do we run to start an npm project?
// A: npm init, enter blank several times

// how do we create the node_modules folder if it doesn't exist?
// A: npm install, it'll check the dependencies in package.json to install everything

// what does the below chunk of code do?
// A: Import express and multer from node_modules as Objects, similar to import np = numpy
const express = require('express');
const multer = require('multer');

// what is app?
// A: It's an instanced express object 
const app = express();

// what is this configuring?
// A: Create an instanced multer object where the destination is configured to public/uploads
// the folder is auto created when there isn't any
const upload = multer({
	dest: 'public/uploads',
});

// what do each of these statements do?
// write the answer next to the line of code
app.use(express.static('public')); // A: Bind a middle ware to an instance of the app object? static middle-ware serves static assets like HTML files, images
app.use(express.urlencoded({ extended: true })); // A:  parses incoming requests with URL-encoded payloads， allows use of request.body, request.file
app.set('view engine', 'ejs'); // A: Set the view engine as ejs

// what type of variable is this?
// A: Array
let serverStoredPosts = [];

// what type of request is this? what does it do?
// A: GET request, once it reaches the dest in the 1st param, execute an anon. function 
app.get('/', (request, response) => {
	// how many different responses can we write? list them.
	// A: send, render
	// how many parameters does response.render use? list them.
	// A: the ejs file to render to, and the data to render 
	// write out the render for index.ejs using the global variable
	response.render('index.ejs', { clientPosts: serverStoredPosts});
});

// what are the three parameters in this function?
// A: directory, function to execute?, an anon function
app.post('/upload', upload.single('theimage'), (req, res) => {
	let currentDate = new Date();

	// what type of data structure is this?
	// A: object {}
	let data = {
		text: req.body.text,
		date: currentDate.toLocaleString(),
		timestamp: currentDate.getTime(),
	};

	// why do we write this if statement?
	// A: To check if there's actually a file uploaded
	if (req.file) {
		data.image = '/uploads/' + req.file.filename;
	}

	// what does the push function do?
	// A: Adds the data to the global array var
	posts.push(data);

	resopnse.redirect('/');
});

// what does the number signify?
// A: Port number
// how do we access this on the web?
// A: localhost:6001
app.listen(11451, () => {
	console.log('server started on port 6001');
});

// continue answering the questions in the index.ejs
