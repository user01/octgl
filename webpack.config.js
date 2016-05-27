var webpack = require('webpack'); //Comment this out if you want to use the noErrorsPlugin below
var path = require('path');

module.exports = {
  //The sources of this app are made from a Typescript file and a Less file,
  //These "entry points" will both respectively import their Typescript aand less dependencies
  entry: {
    controller: [
      './code/controller.ts',
    ],
    screen: [
      './code/screen.ts',
    ]
  },
  //The output is a single bundle of js and css which is loaded by index.html
  output: {
    path: './build/generated', //Path where bundle.js is generated on the file system
    publicPath: '/generated/', //Relative parent URL of the bundle
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js', '.less', '.css'],
    modulesDirectories: ['node_modules', 'src'],
    fallback: path.join(__dirname, 'node_modules')
  },
  plugins: [
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  node: {
    __dirname: true,
    net: "empty",
    tls: "empty",
    fs: "empty"
  },
  module: {
    loaders: [
      { test: /\.ts$|\.tsx$/, loader: 'ts-loader?sourceMap' },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.css$/, loader: "style!css!less" }
    ]
  }
};
