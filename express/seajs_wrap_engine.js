// express js engin
// example: app.engine('js', jsEngine);
// note: add engine before set `public` path

var fs = require('fs');

module.exports = function jsEngine(file, options, fn)
{
	fs.readFile(file, function(err, content)
	{
		if (err) return fn(err);

		fn(null, [
			'define(function(require, exports, module){',
				content.toString(),
			'});'
		].join('\n'));
	});
};
