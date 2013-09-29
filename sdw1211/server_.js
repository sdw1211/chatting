var app = require("http").createServer(handler).listen(5023), io = require("socket.io").listen(3000), fs=require("fs"), names = [];

function handler(req, res) {
	fs.readFile(__dirname + "/index.html", function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end("Error Loading index.html");
		}

		res.writeHead(200, {"Context-Type": "text/html"});
		res.end(data);
	});
}

io.sockets.on("connection", function(socket) {
	console.log("log : in");

	socket.emit("names", names);

	socket.on("join", function(name) {
		var oldIdx = socket.userIndex;
		
		if (oldIdx) {
			deleteName(oldIdx);
		}
	
		names.push(name);
		socket.userIndex = names.length;
		socket.name = name;

		socket.broadcast.emit("joinok", name);
		io.sockets.emit("names", names);

		console.log("log : join", ", Name:", socket.userName, ", Names:", names);
	});

	socket.on("inputMessage", function(message) {

		socket.broadcast.emit("message", message);
	});

	socket.on("disconnection", function() {
		socket.broadcast.emit("disconnect", socket.name);
		deleteName(socket.userIndex);
		socket.broadcast.emit("message", names);
	});
});

function deleteName(idx) {
	delete names[idx - 1];
}
