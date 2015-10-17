/// Require necessary dependencies
var fs = require('fs');
var koa = require('koa');
var server = koa();
var serve = require('koa-static');


/// Redirect HTTP to HTTPS
/*server.use(function* (next) {
	if(process.env.NODE_ENV === 'production' && this.request.headers['x-forwarded-proto'] != 'https')
	{
		this.redirect('https://' + this.request.hostname + this.request.originalUrl);
	}
	
	else yield next;
});*/



/// Example API request handling
/*server.use(function *(next) {
	if(this.request.path !== '/api/roles') return yield next;
	
	var data = yield function (next) {
		fs.readFile(__dirname + '/roles.json', function(err, data) {
			if(err) next(err, null);
			else next(null, JSON.parse(data));
		});
	};
	
	this.body = data;
});*/



/// Redirect non-file-ish queries to index
server.use(function* (next) {
	if(this.request.path.length && /^(\/[\-_a-z0-9]+)+\/?$/i.test(this.request.path))
	{
		this.request.path = '/';
	}
	
	yield next;
});

function readFile(path) {
	return new Promise(function(resolve, reject) {
		fs.readFile(path, { encoding: 'utf8' }, function(err, data) {
			if(err) reject(err); else resolve(data);
		})
	})
}

function readJSON(path) {
	return new Promise(function(resolve, reject) {
		fs.readFile(path, { encoding: 'utf8' }, function(err, data) {
			if(err) reject(err);
			var json;
			try { json = JSON.parse(data) }
			catch(e) { return reject(e) }
			resolve(json);
		})
	})
}

function inlineDocumentation(json) {
	var articles = Object.keys(json.interfaces)
	.filter(function(interface) { return 'article' in json.interfaces[interface] });
	
	var docs = Object.keys(json.interfaces)
	.filter(function(interface) { return 'documentation' in json.interfaces[interface] });
	
	return Promise.all([
		Promise.all(
			articles.map(function(interface) {
				var path = json.interfaces[interface].article;
				return readFile(__dirname + '/frontend/' + path);
			})
		).then(function(files) {
			articles.forEach(function(key, index) {
				var file = files[index];
				var interface = json.interfaces[key];
				interface.article = file;
			});
		}),
		
		Promise.all(
			docs.map(function(interface) {
				var path = json.interfaces[interface].documentation;
				return readJSON(__dirname + '/frontend/' + path);
			})
		).then(function(files) {
			docs.forEach(function(key, index) {
				var file = files[index];
				var interface = json.interfaces[key];
				interface.documentation = file;
			});
		})
	]);
}


server.use(function* (next) {
	if(this.request.path && this.request.path === '/documentation.json')
	{
		var docs = yield readJSON(__dirname + '/frontend/documentation.json');
		yield inlineDocumentation(docs);
		docs.inlined = true;
		this.body = docs;
		
		//if(process.env.NODE_ENV === 'production');
		//else yield next;
	}
	
	else yield next;
})




/// Define a static directory to serve
server.use(serve('./frontend'));



if(!module.parent)
{
	/// Launch the server locally
	var port = process.env.PORT || 8045;
	server.listen(port);
	console.log('Launching webserver at localhost:' + port);
}
else
{
	/// Export the koa server
	module.exports = server;
}
