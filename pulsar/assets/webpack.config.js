const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, options) => ({
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: false }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  entry: {
    app: glob.sync("./vendor/**/*.js").concat(["./js/app.js"]),
    "clicker-app": glob
      .sync("./vendor/**/*.js")
      .concat(["./js/clicker/clicker-app.js"]),
    "audience-app": glob
      .sync("./vendor/**/*.js")
      .concat(["./js/audience/audience-app.js"]),
    slides: glob.sync("./vendor/**/*.js").concat(["./js/slides/slides.js"])
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "../priv/static")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "./css/[name].css" }),
    new CopyWebpackPlugin([{ from: "static/", to: "./" }])
  ]
});
