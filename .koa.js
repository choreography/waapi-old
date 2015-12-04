/// Require necessary dependencies
var fs = require('fs');
var koa = require('koa');
var server = koa();
var serve = require('koa-static');
var staticCache = require('koa-static-cache');
var enforceHTTPS = require('koa-sslify');


/// Force HTTPS on all requests
server.use(enforceHTTPS({
	trustProtoHeader: true
}));



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



server.use(function* (next) {
// 	<!-- JSON-LD -->
// 	<script type="application/ld+json"></script>
	
// 	<!-- Main Content -->
	
// 	'/': App.Intro,
// 	'/interface/:name': App.Interface,
	
	
	
	yield next;
});


/// Redirect non-file-ish queries to index, otherwise load .html and .json content for articles
server.use(function* (next) {
	if(this.request.path.length && /^(\/[\-_a-z0-9]+)+\/?$/i.test(this.request.path))
	{
		var index = yield readFile(__dirname + '/frontend/index.html');
		
		var route = this.request.path.match(/^\/interface\/([\-_a-z0-9]+)$/i);
		var exists = false;
		if(route) exists = yield fileExists(__dirname + '/frontend/docs/' + route[1] + '.html');
		
		if(route)
		{
			if(exists)
			{
				var article = yield readFile(__dirname + '/frontend/docs/' + route[1] + '.html');
				var jsonLD = yield readFile(__dirname + '/frontend/docs/' + route[1] + '.json');
				
				if(jsonLD) index = index.replace('<!-- JSON-LD -->', '<script type="application/ld+json">' + jsonLD + '</script>');
				if(article)
				{
					article = article
						.replace(/<code class="block([\w ]+)?">\s+/gm, '<code class="block$1">')
						.replace(/\s+<\/code>/gm, '</code>');
					index = index.replace('<!-- Main Content -->', article);
				}

				this.body = index;
			}
			
			else
			{
				index = index.replace('<!-- Main Content -->', '<h1 class="herald">Not Found</h1><br><p><a href="/" class="inline">Back to homepage?</a></p>');
				
				this.status = 404;
				this.body = index;
			}
		}

		else
		{
			this.request.path = '/';
			yield next;
		}
	}
	
	else yield next;
});


server.use(function* (next) {
	if(this.request.path === '/')
	{
		var index = yield readFile(__dirname + '/frontend/index.html');
		var article = yield readFile(__dirname + '/frontend/docs/Default.html');
		var jsonLD = yield readFile(__dirname + '/frontend/docs/Default.json');

		if(jsonLD) index = index.replace('<!-- JSON-LD -->', '<script type="application/ld+json">' + jsonLD + '</script>');
		if(article) index = index.replace('<!-- Main Content -->', article);
		
		this.body = index;
	}
	
	else yield next;
});



function fileExists(path) {
	return new Promise(function(resolve, reject) {
		fs.stat(path, function(err, stats) {
			resolve(stats? stats.isFile(): false);
		});
	});
}

function readFile(path) {
	return new Promise(function(resolve, reject) {
		fs.readFile(path, { encoding: 'utf8' }, function(err, data) {
			/*if(err) reject(err); else*/ resolve(data);
		})
	})
}

/*function readJSON(path) {
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

server.use(function* (next) {
	if(this.request.path && this.request.path === '/documentation.json')
	{
		var docs = yield readJSON(__dirname + '/frontend/documentation.json');
		this.body = docs;
	}
	
	else yield next;
})*/



if(process.env.NODE_ENV === 'production')
{
	server.use(staticCache('./frontend', {
		buffer: true,
		gzip: true
// 		maxAge: 4 * 24 * 60 * 60
	}));
}




/// Define a static directory to serve
server.use(serve('./frontend'));



if(!module.parent)
{
	/// Launch the server locally
	var port = process.env.PORT || 8039;
	server.listen(port);
	console.log('Launching webserver at localhost:' + port);
}
else
{
	/// Export the koa server
	module.exports = server;
}
