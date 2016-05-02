//var webpack = require( 'webpack' ); //Comment this out if you want to use the noErrorsPlugin below
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
  //The list of extension that will be resolved for modules
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js', '.less', '.css'],
    modulesDirectories: ['node_modules', 'src'],
    fallback: path.join(__dirname, 'node_modules'),
    alias: {
      'handlebars': 'handlebars/runtime.js'
    }
  },
  resolveLoader: {
    fallback: path.join(__dirname, 'node_modules'),
    alias: {
      'hbs': 'handlebars-loader'
    }
  },

  //JQuery and React are directly loaded in index.html using a script tags
  // so they must not be bundled.
  // 1. smaller bundle = faster generation times
  // 2. browser caching can be used on these two libraries
  externals: {
    "babylon": "babylon"
  },
  // ts-jsx-loader: will transform the React.jsx calls with the passed JSX into React Typescript
  // ts-loader will transpile the Typescript into Javascript
  // less: transpiles LESS into CSS
  // css: generates a 'compiled' CSS string
  // style: insert a style tag with the CSS in the page
  module: {
    preLoaders: [
      { test: /\.json$/, loader: 'json' },
    ],
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader?sourceMap' },
      { test: /\.(less|css)$/, loader: "style!css!less" }
    ]
  }
  // Optional plugin which prevents the display of an error page in case of
  // a compilation error when using webpack-dev-server
  //plugins: [
  //    new webpack.NoErrorsPlugin() //Stops hot reloading until the compilation error is fixed
  //]
};
