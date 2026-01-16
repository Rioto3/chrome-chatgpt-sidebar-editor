// webpack.config.js
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 1. 出力先ディレクトリを環境に応じて決定
const platform = process.env.PLATFORM;
const environment = process.env.NODE_ENV;

if (!platform) {
  throw new Error("PLATFORM is not set (firefox | chrome)");
}

if (!environment) {
  throw new Error("NODE_ENV is not set (development | production)");
}

const outputDir = `build/${platform}/${environment}`;


module.exports = {
  devtool: "cheap-module-source-map", // または "source-map"
  mode: 'development',
  output: {
    path: path.resolve(__dirname, outputDir),
    filename: '[name].js'
  },
  module: {
    rules: [
      // === React(JSX)用 ===
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },

      // === Tailwind + PostCSS 用 ===
      {
        test: /\.css$/i,
        use: [
          "style-loader",   // <style> タグとして埋め込む
          "css-loader",     // CSSをJSに取り込む
          "postcss-loader", // Tailwind + autoprefixer を通す
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  entry: {
    popup: './src/app/popup/page.jsx',
    settings: './src/app/settings/page.jsx',
    sidepanel: './src/app/sidepanel/page.jsx',
    background: './src/app/background/index.js',
    content: './src/app/content/main.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/app/template.html",
      filename: "popup.html",
      chunks: ['popup'],
      inject: "body", // ✅ ← これが重要！
    }),

    new HtmlWebpackPlugin({
      template: "src/app/template.html",
      filename: "sidepanel.html",
      chunks: ['sidepanel'],
      inject: "body", // ✅ ← これが重要！
    }),


    new HtmlWebpackPlugin({
      template: "src/app/template.html",
      filename: "settings.html",
      chunks: ['settings'],
      inject: "body", // ✅ ← これが重要！
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/manifests/master.json', to: "manifest.json",
          transform: (content, path) => {
            // content は manifest.json のバッファ（Buffer）なので、文字列に変換
            const manifest = JSON.parse(content.toString());
            // 🌟 ここで変数を埋め込む 🌟
            // package.json からバージョンを取得して埋め込む
            manifest.version = require('./package.json').version;
            manifest.name = require('./package.json').name;
            manifest.description = require('./package.json').description;
            // JSON文字列に戻して返す
            return JSON.stringify(manifest, null, 2);
          },
        },

        { from: "public/icons/**/*", to: "[name][ext]" },
        // { from: "src/app/content.js", to: "content.js" },

      ],
    }),
  ],
};