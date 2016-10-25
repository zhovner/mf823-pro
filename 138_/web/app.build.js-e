({
	appDir : "./",
	baseUrl : "js",
	dir : "../webapp-build",
	mainConfigFile : 'js/main.js',
	fileExclusionRegExp : /^\.|\/test\/*|\/m\/*|mobile.html/,
	//Comment out the optimize line if you want
	//the code minified by UglifyJS
	optimize : "none",
	optimizeCss : "standard.keepLines",
	preserveLicenseComments : "false",
	removeCombined : true,
	modules : [{
			name : "main",
			exclude : ["jquery"],
			include : [
                'config/config',
                'config/menu',
				'language',
				'logout',
				'status/statusBar',
				'theme',
				'router',
				'login'],
			insertRequire : ['app']
		}, {
			name : "knockout",
			insertRequire : ['lib/knockout/knockout.simpleGrid']
		}
	]
})