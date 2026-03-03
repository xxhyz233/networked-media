const express = require('express');
const multer = require('multer');
// Set up applications that use our libraries
const app = express();
const uploadProcessor = multer({ dest: "public/uploads/" });

let posts = [];

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
    response.render('index.ejs', {allPosts: posts});
});

// Adding a 2nd param to the post handler to process the file that is uploaded
app.post('/makePost', uploadProcessor.single('myImage'), (request, response)=>{
    let individualPost = {
        caption: request.body.caption

    }
    if (request.file) {
        individualPost.file = request.file.filename;
    }
    posts.push(individualPost);
    console.log(individualPost);
    response.redirect('/');
})

app.listen(5001, ()=>{
    console.log('server is running on 5001')
})