module.exports = {
  entry: './static/src/app.js',
  output: {
    path: './static/bin',
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }]
  }
}
