module.exports = function(grunt)
{
	grunt.registerMultiTask('seajs_wrap', 'wrap package width seajs', function()
	{
		var _oOpts = this.options(
		{
			from_path: '',
			target_path: '',
			separator: '\n',
			remove_define: true,
			nowrap: false,
			process: null
		});
		var _oData = this.data;
		var _sFromPath = _oOpts.from_path+'/'+_oData.src_path+'/';
		var _sToPath = _oOpts.target_path+'/'+(_oData.dest_path || _oData.src_path)+'/';


		// add define wrap
		if (typeof(_oData.wrapfiles) != 'object') throw new Error('no wrapfiles param');

		for(var _sFilePatterns in _oData.wrapfiles)
		{
			var _oCfg = _oData.wrapfiles[_sFilePatterns];

			grunt.file.expand(
			{
				cwd: _sFromPath,
				filter: 'isFile'
			}, _sFilePatterns)
			.forEach(function(_asFile)
			{
				grunt.log.writeln('concat file: '+ _asFile);

				// file content start
				var _sNewFileContent = _oOpts.nowrap === true ? [] : ['define(function(require, exports, module){'];
				// wrap, fix this
				_sNewFileContent.push(';(function(){');

				if (_oOpts.remove_define)
				{
					_sNewFileContent.push('var define;');
				}

				// add requires
				if (typeof(_oCfg.inner_requires) == 'object')
				{
					var _oTempInnerRequires = {};
					for(var requireVar in _oCfg.inner_requires)
					{
						if (_oTempInnerRequires[_oCfg.inner_requires[requireVar]])
						{
							_oTempInnerRequires[_oCfg.inner_requires[requireVar]].push(requireVar);
						}
						else
						{
							_oTempInnerRequires[_oCfg.inner_requires[requireVar]] = [requireVar];
						}
					}

					for(var requireVal in _oTempInnerRequires)
					{
						var _sVarName = _oTempInnerRequires[requireVal][0];
						_sNewFileContent.push(['var ', _sVarName, '=', 'this.', _oTempInnerRequires[requireVal].join('=this.'), '=', 'require("', requireVal, '");'].join(''));

						if (_oTempInnerRequires.length == 1) continue;
						_oTempInnerRequires[requireVal].forEach(function(_asVarName, _anIndex)
						{
							if (!_anIndex) return;
							_sNewFileContent.push(['var ', _asVarName, '=', _sVarName, ';'].join(''));
						});
					}
				}

				// remove map file link
				var _sFileContent = grunt.file.read(_sFromPath+_asFile).replace(/^\/\/# *sourceMappingURL *=.+$/igm, '');

				// add file content
				_sNewFileContent.push(_sFileContent);

				// add exprots
				if (_oCfg.outer_exports)
				{
					if (typeof(_oCfg.outer_exports) == 'string')
					{
						_sNewFileContent.push('module.exports='+_oCfg.outer_exports+';');
					}
					else if (typeof(_oCfg.outer_exports) == 'object')
					{
						var _sExports = [];
						for(var _sName in _oCfg.outer_exports)
						{
							_sExports.push(_sName+':'+_oCfg.outer_exports[_sName]);
						}
						_sNewFileContent.push('module.exports={'+_sExports.join(',')+'};');
					}
				}

				if (grunt.util._.isArray(_oCfg.remove_window_vars))
				{
					_oCfg.remove_window_vars.forEach(function(_asVarName)
					{
						// _sNewFileContent.push('delete window.'+_asVarName+';');
						// ie 9 8 error width delete
						_sNewFileContent.push('window.'+_asVarName+' = null;');
					});
				}

				// file content end
				_sNewFileContent.push('}).call({});');
				if (_oOpts.nowrap !== true) _sNewFileContent.push('});');

				var _sContent = _sNewFileContent.join(_oOpts.separator);
				if (_oOpts.process) _sContent = _oOpts.process(_sContent, _asFile, _oOpts);

				grunt.file.write(_sToPath+_asFile, _sContent);
			});
		}
	});
};
