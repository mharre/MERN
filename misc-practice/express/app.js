const express = require('express');
const bodyParser = require('body-parser'); 

const app = express();

//app.use((req, res, next) => {
//    let body = '';
//    req.on('end', () => {
//        const userName = body.split('=')[1]
//        if (userName) {
//            req.body = {name: userName}
//        }
//        next(); // only goes to next if we are done parsing incoming data
//    })
//    req.on('data', (chunk) => {
//        body += chunk;
//    })
//});

app.use(bodyParser.urlencoded({ extended: false })); //parse ALL incoming request and try to extract all data possible, also calls next for us

app.post('/user', (req, res, next) => { // 2 params, first is filtering for path, second is func
    res.send(`<h1>${req.body.username}</h1>`); //available based on the name="..."
});

app.get('/', (req, res, next) => {
    res.send('<form action="/user" method="POST"><input type="text" name="username"><button type="submit">Create User</button></form>');
});

app.listen(5000);