//const fs = require('fs')
//
//const userName = 'Matthew';
//
////console.log(userName);
//fs.writeFile('user-data.txt', 'Name: ' + userName, (error) => {
//    if (error) {
//        console.log(error)
//    }
//    console.log('WROTE FILE');
//});

const http = require('http')
const server = http.createServer((req, res) => {
    console.log('INCOMING REQUEST');
    console.log(req.method, req.url); //gives us whatever method was used and url 

    if (req.method === 'POST') {
        let body = '';
        req.on('end', () => {
            //console.log(body)
            const userName = body.split('=')[1]; // returns 2 arrays, before / after split
            res.end(`${userName}`)
        });

        req.on('data', (chunk) => { // we get data in chunks, not all at once
            body += chunk;
        });
    } else {
        res.setHeader('Content-Type', 'text/html')
        res.end('<form method="POST"><input type="text" name="username"><button type="submit">Create User</button></form>');
    }
});

server.listen(5000);