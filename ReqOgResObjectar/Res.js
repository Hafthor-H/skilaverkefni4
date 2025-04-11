const http = require('http');

// environment breytuna má stilla með skipunum (í skipanalínu):
// á pc er það set PORT=x, t.d. set PORT=5000 til að 
// fá port 5000
// á mac er það export PORT=x,, t.d. set PORT=5000 til að 
// fá port 5000
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
	res.writeHead(200);
	console.log(res);
	// þægilegri til lestrar er hinsvegar næsta lína
	// console.dir(res, { depth: 0 });
	res.end();
}).listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
