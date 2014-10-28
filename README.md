grunt-seajs-wrap
================

Wrap package width seajs


## Installation

	$ npm install grunt-seajs-wrap --save-dev

## Usage

### Grunt Task

	grunt.loadNpmTasks('grunt-seajs-wrap');

	// Grunt config:

	grunt.initConfig(
	{
		seajs_wrap: {
			options: {
				from_path: 'bower_components',
				target_path: 'public',
				separator: '\n\n',
				nowrap: false
			},
			jquery: {
				src_path: 'jquery/dist',
				dest_path: 'jquery',
				wrapfiles: {
					'*.js': {
						inner_requires: {},
						remove_window_vars: ['jQuery', '$'],
						outer_exports: 'jQuery'
					}
				}
			},
			backbone: {
				src_path: 'backbone',
				wrapfiles: {
					'backbone.js': {
						inner_requires: {
							'_': 'underscore',
							'underscore': 'underscore',
							'$': 'jquery',
							'jQuery': 'jquery'
						},
						remove_window_vars: ['Backbone'],
						outer_exports: 'this.Backbone'
					}
				}
			}
		}
	});


## Express Engine

	var app = require('express')();
	app.engine('js', require('grunt-seajs-wrap'));

	app.get(/^\/(.+\.js)(\?.*)?$/i, function(req, res, next)
	{
		var _sFile = req.params[0];
		// Ignore
		if (_sFile.indexOf('com/') === 0)
		{
			next();
		}
		else
		{
			res.render(req.params[0]);
		}
	});

	// before set public path
	app.use(expr.static('public'));