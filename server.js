// London By Sea server
require('dotenv').config()
var http = require('http');
var Url = require('url');
var path = require('path');
var Router = require('routes');
var cookie = require('cookie')
var cheerio = require('cheerio')
var domtoimage = require('dom-to-image');
var fs = require('fs');
var sql = require("sqlite3");
var formidable = require("formidable");
var CryptoJS = require("crypto-js");
var OK = 200, NotFound = 404, BadType = 415;
var router = new Router();
var db = new sql.Database("database.db");
var is = db.prepare("INSERT INTO images VALUES (?,?)");
var us = db.prepare("SELECT * FROM users WHERE username=?");
var gi = db.prepare("SELECT * FROM images WHERE name=?");
var gu = db.prepare("SELECT * FROM users WHERE username=?");
var cu = db.prepare("INSERT INTO users VALUES (?,?,?,?,?)");

start(8080);

router.addRoute('/:n.:f', getPage);
router.addRoute('/images/:title', getExtra);
router.addRoute('/scripts/:title', getExtra);
router.addRoute('/stylesheets/:title', getExtra);
router.addRoute('/node_modules/*', getExtra);
router.addRoute('/save', saveImage);
router.addRoute('/account', doAccount);
router.addRoute('/account/login', signIn);
router.addRoute('/account/create', createUser);
router.addRoute('/account/delete', deleteUser);

// Provide a service to localhost only.
function start(port) {
  var service = http.createServer(handle);
  service.listen(port, 'localhost');
  console.log("Visit localhost:" + port);
}

// Deal with a request.
function handle(request, response) {
	console.log("Method:", request.method);
	console.log("URL:", request.url);
	console.log("Headers:", request.headers);
	var url = request.url;

	if (url.endsWith("/")) url = url + "index.html";
	if (url.endsWith("?")) url = url.slice(0, -1);
	if (!router.match(url) || !url.startsWith("/") || url.includes("/.") || url.includes("//") || url.includes("..")) {
		return fail(response, BadType, "Invalid URL")
	}

	var match = router.match(url);
	match.fn(request, response, match);
	// var full_path = path.join(process.cwd(),my_path);
	// console.log(full_path);
	// reply(response);
}

function getPage(request, response, match) {
	var file = "./public" + request.url;
	fs.readFile( file, function(err, content){
		var extension = path.extname(Url.parse(request.url).pathname).split('.')[1];
		reply(response, extension, err, content);
	});
}

function getExtra(request, response, match) {
	console.log('Extra url ', request.url);
	var file = "." + request.url;
	// var file = "./public/index.html";
	fs.readFile( file, function(err, content){
		var extension = path.extname(Url.parse(request.url).pathname).split('.')[1];
		reply(response, extension, err, content);
	});
}

function saveImage(request, response, match) {

	var options = {
		host: 'localhost',
		port: 8080,
		path: '/account',
		// headers: {
		// 	'Set-Cookie': cookie_header
		// }
	}
	http.get(options, function(res) {
		console.log("Gimme headas", res.headers);
	});
	// Parse the cookies on the request
	var cookies = null;
	if (request.headers.cookie) {
		cookies = cookie.parse(request.headers.cookie || '');
	}
	// Get the visitor name set in the cookie
	// Decrypt login token and see if it matches username
	var login = cookies == null ? null : cookies.login;
	if (login) {
		var bytes  = CryptoJS.AES.decrypt(login, process.env.SECRET_KEY);
		var token = bytes.toString(CryptoJS.enc.Utf8);
		var username = cookies.username;
		if (token == username) {
			fs.readFile( "./public/designcard.html", {encoding: "utf8"}, function(err, content){
				if (err) {
					throw err;
				}
				else {
					var now = new Date().toLocaleString();
					console.log(content);
					$ = cheerio.load(content.toString());
					domtoimage.toBlob($('#card_image'))
					.then(function (blob) {
						var filename = `private/images/${name}/im` + now + ".png";
							fs.writeFile(filename,  blob, "binary", function(err){
								if (err) throw err;
								is.run(name, filename);
								console.log('File saved.');
							});
					});
				}
				var extension = path.extname(Url.parse(request.url).pathname).split('.')[1];
				reply(response, 'html', err, content);
			});
		}
	}
	else {
		goToSignIn(response);
	}
}

function doAccount(request, response, match) {
	// Parse the cookies on the request
	var login_cookie = null;
	var username_cookie = null;
	if (request.headers['set-cookie']) {
		var login_cookie = cookie.parse(request.headers['set-cookie'][0] || '');
		var username_cookie = cookie.parse(request.headers['set-cookie'][1] || '');
		console.log("Username cookie: ", username_cookie );
	}
	var cookies = null;
	if (request.headers.cookie) {
		cookies = cookie.parse(request.headers.cookie || '');
	}

	// Get the visitor name set in the cookie
	// Decrypt login token and see if it matches username
	var login_set = login_cookie == null ? null : login_cookie.login;
	var login = cookies == null ? null : cookies.login;
	if (login || login_set) {
		login = login_set == null ? login : login_set;
		var bytes  = CryptoJS.AES.decrypt(login, process.env.SECRET_KEY);
		var token = bytes.toString(CryptoJS.enc.Utf8);
		var username = username_cookie == null ? cookies.username : username_cookie.username;
		if (token == username) {
			fs.readFile( "./private/account.html", {encoding: "utf8"}, function(err, content){
				if (err) throw err;
				else {
					// console.log(content);
					$ = cheerio.load(content.toString(), {
						xmlMode: true
					});
					// console.log($);
					us.get(username, function(err, row) {
						if (err) throw err;
						else {
							var fullname = row.first_name + " " + row.last_name;
							var email = row.email;
							$('#intro_section>p').text('Welcome back, ' + fullname + '!');
							$('#full_name').text(fullname);
							$('#email_addr').text(email);
							gi.all(username, function(err, rows) {
								if (err) throw err;
								else {
									for (row in rows) {
										var image_tag = `<img class="first" src="../${row.filename}" alt="" />`
										$('.photobanner').append(image_tag);
									}
									var page = $.html();
									// console.log(page);
									reply(response, 'html', err, page);
								}
							});
						}
					});
				}
			});
		}
	}
	else {
		goToSignIn(response);
	}
}

function goToSignIn(response) {
	var options = {
		host: 'localhost',
		port: 8080,
		path: '/signin.html',
		// headers: {
		// 	connection: 'keep-alive'
		// }
	}
	http.get(options, function(res) {
		res.setEncoding('binary');

		var page = ''
		res.on('data', function(chunk){
			// console.log("Save Image Request", chunk);
			page += chunk;
		})

		res.on('end', function(err){
			reply(response, 'html', err, page);
		})
	});
}

function signIn(request, response, match) {
	var form = new formidable.IncomingForm();
	console.log('In sign in route');
	form.parse(request, function (err, fields, files) {
		if (err) throw err;
		// // response.writeHead(200, {
		// // 	'content-type': 'text/plain'
		// // });
		// response.write('Received signin request-\n\n');
		console.log(fields);
		// var temp = gu.run(fields.username);
		// console.log(temp);
		if (fields.username) {
			console.log('here?\n\n');
			gu.get(fields.username, function(err, row) {
				console.log('Ran db request?', row);
				if (err) throw err;
				if (row) {
					console.log('Found User...');
					if (fields.password == row.password) {
						var login_token = CryptoJS.AES.encrypt(row.username, process.env.SECRET_KEY);
						var cookie_header = [
							cookie.serialize('login', String(login_token), {
								maxAge: 60 * 60 // 1 hour
							}), cookie.serialize('username', String(row.username), {
								maxAge: 60 * 60 // 1 hour
							})
						];
						response.setHeader('Set-Cookie', cookie_header);
						// response.setHeader('Set-Cookie', cookie.serialize('username', String(row.username), {
						// 	maxAge: 60 * 60 // 1 hour
						// }));
						var options = {
							host: 'localhost',
							port: 8080,
							path: '/account',
							// headers: {
							// 	'Set-Cookie': cookie_header
							// }
						}
						http.get(options, function(res) {
							res.setEncoding('binary');

							var page = ''
							res.on('data', function(chunk){
								// console.log("Save Image Request", chunk);
								page += chunk;
							})

							res.on('end', function(err){
								reply(response, 'html', null, page, cookie_header);
							})
						});
					}
				}
			});
		}
		else {
			response.write("<script language='javascript'>alert('Incorrect Username/Password; Please Try Again');</script>", function(req, res) {
				goToSignIn(response);
			});
		}
	});
}

function createUser(request, response, match) {
	var form = new formidable.IncomingForm();
	console.log('In sign in route');
	form.parse(request, function (err, fields, files) {
		if (err) throw err;
		console.log('Form fields: ', fields);

		cu.run(fields.username, fields.email, fields.password, fields.firstname, fields.lastname, function(err) {
			console.log('Ran db request?');
			if (err) throw err;
			response.write("Created new user!");
			goToSignIn(response);
		});
	});
}

function deleteUser(request, response, match) {
// TODO: implement
}

// Send a reply.
function reply(response, extension, err, content, cookie_val=null) {
	var types = {
		css : 'text/css',
		js : 'application/javascript',
		png: 'image/png',
		svg: 'image/svg+xml',
		html: 'application/xhtml+xml',
		xhtml: 'application/xhtml+xml',
	}
	// console.log('Content', response);
	if (err) return fail(response, NotFound, "..." + err);
  var hdrs = {
		'Content-Type': types[extension],
		cookie: cookie_val
	};
  response.writeHead(200, hdrs);  // 200 = OK
  response.write(content);
  response.end();
}

function fail(response, code, message) {
  var hdrs = { 'Content-Type': 'text/plain' };
  response.writeHead(code, hdrs);
  response.write(message);
  response.end();
}
