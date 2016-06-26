const path               = require('path');
const webpack            = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const Paths = {
	src: path.join(__dirname, 'src'),
	build: path.join(__dirname, 'build')
};


module.exports = {
	entry  : {
		bot: Paths.src
	},
	output : {
		path    : Paths.build,
		filename: '[name].js',
	},
	module : {
		loaders: [
			{
				test   : /\.js/,
				exclude: path.join(__dirname, 'node_modules'),
				loader : 'babel'
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin([ Paths.build ]),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	],
	resolve: {
		extensions: [ '', '.js', '.ts' ]
	}
};