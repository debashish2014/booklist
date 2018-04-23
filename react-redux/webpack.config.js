var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
var SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
var path = require("path");
const isProd = process.env.NODE_ENV == "production";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurifyCSSPlugin = require("purifycss-webpack");

module.exports = {
  entry: {
    main: "./reactStartup.js"
  },
  output: {
    filename: "[name]-bundle.js",
    chunkFilename: "[name]-chunk.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "react-redux/dist/"
  },
  resolve: {
    modules: [path.resolve("./"), path.resolve("./node_modules")]
  },
  mode: 1 || isProd ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["react"],
          plugins: ["transform-class-properties", "transform-object-rest-spread"]
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: ["html1.htm", "reactStartup.js"].map(f => path.join(__dirname, f))
    })
  ]
};
