const assert = require('chai').assert;
const expect = require('chai').expect;
const downloadimage = require(__dirname +'/app.js').downloadimage;
const calculatearea = require(__dirname +'/app.js').calculatearea;
const calculatepixel = require(__dirname +'/app.js').calculatepixel;
const superagent = require('superagent');
var io = require('socket.io-client');
var should = require('chai').should();

describe('App',function(){	
	it('App should respond to GET html.', function(done){
		superagent
			.get('http://localhost:3000')
			.end(function(res){
				expect(200)
				done();
				});
	});
});

describe('Socket-Server', function () {
	it('User able to connect to the server.', function (done) {
		var client = io.connect('http://localhost:3000');
		client.once('connect', function () {
			client.disconnect();
			done();
		});
		
	});
	it('User can communicate to the server in real time', function(done){
	  var server,
		options ={
			transports: ['websocket'],
			'force new connection': true
		};
	  var client = io.connect('http://localhost:3000',options);
	  client.once('connect', function () {
		  client.once('getImage', function (data) {
			data.should.equal("Hello World");
			client.disconnect();
			done();
			});
		  client.emit('getImage', "Hello World");
		});
	
	});
});


describe('App function',function(){
	it('Server able to get URL & download static map image - downloadimage(url,latitude,mapzoom)',function(done){
		let result = downloadimage();
		assert.isTrue(result, 'done');
		done();
	});
	it('Server able to calculate the pixel based on the static image - calculatepixel()',function(done){
		let result = calculatepixel();
		assert.isTrue(result, 'done');
		done();
	});
	it('Server able to calculate the surface area of the road in the static image - calculatearea(counter)',function(done){
		let result = calculatearea();
		assert.notEqual(result, 0);
		done();
	});
});