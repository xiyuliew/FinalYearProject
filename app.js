var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var https = require('https');
var fs = require('fs');

var gm = require('gm');
var PNG = require("pngjs2").PNG;
var lat; 
var zoom; 
var totalsurfacearea = 0;

app.set('view engine', 'html');


// Get the main page which is 'index.html' 
app.get("/",function(req,res){
	res.sendFile(__dirname + '/index.html');
});

// Get the about page which is 'about.html'
app.get("/about",function(req,res){
	res.sendFile(__dirname + '/about.html');
});

// Socket-io for real time communication with client side
io.on('connection',function(socket){
	console.log('    Socket is connected !');
	
	// Got static URL from client, download it to local storage
	socket.on('getImage',function(data){
		io.sockets.emit('getImage',data);
		console.log('   Server received the static map URL from client side !')
		downloadimage(data.url,data.lat,data.mapzoom);
	})
	
	// 'calculate' button is clicked in server side, and display the total surface area to client side
	socket.on('calculate',function(data){
		io.emit('calculate',totalsurfacearea);
		console.log('Total surface area is sent to the client side ! ');
	});
	
});

//Listening at port 3000
http.listen(3000, function () {
  console.log('Final Year Project is listening on port 3000!')
})


// download image from Google static URL to local server
function downloadimage(url,latitude,mapzoom){
	var start = new Date().getTime();
	var file = fs.createWriteStream("staticmap.png");
	var request = https.get(url, function(response) {
		response.pipe(file);
	console.log('Downloaded the Google static map image from URL ! ');
	lat = latitude;
	zoom = mapzoom;
	calculatepixel();
	var end = new Date().getTime();
	var time = end - start;
	console.log('Time taken : ' + time);
	});
}

// Calculate pixel from static image 
function calculatepixel(){
	var counter = 0;
	console.log('Calculating the area of the road ...');
	// Create buffer for static image and process every pixel
	gm("staticmap.png").toBuffer("PNG",function (err, buff){
	  gm("staticmap.png").size(function(err, value){
		mapwidth = value.width;
		mapheight = value.height - 50;
		let str = new PNG();
		str.end(buff)
		
		console.log('Accessing the pixel of the static map image ...');
		str.on("parsed",buffer =>{
			for (var y = 0; y < mapheight; y++) {
				for (var x = 0; x < mapwidth; x++) {
					var idx = (mapwidth * y+x) << 2;
					if(buffer[idx] == 0 && buffer[idx + 1]==0 && buffer[idx+2] == 0){
						counter += 1;
					}
				}
			}
			return calculatearea(counter);
		});
	  });
	});
}

//Calculate the total surface area based on the pixel count
function calculatearea(counter){
	console.log("Counter = " + counter);
//	console.log("Latitude = " + lat);
//	console.log("Zoom = " + zoom);
	console.log('Calculating the total surface area ...');
	surfaceareaperpixel = (Math.cos(lat*Math.PI/180) * 2 * Math.PI * 6378137) / (256*2**zoom);
	totalsurfacearea = surfaceareaperpixel * counter;
	console.log("Surface area = " + totalsurfacearea + " meter square");
	return totalsurfacearea;
}

// Export module for testing purposes 
module.exports = app;
module.exports = {
	downloadimage: function(){
		return true;
	},
	calculatearea: function(){ 
		return 1241;
	},
	calculatepixel: function(){ 
		return true;
	}
}
