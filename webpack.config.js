const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const isDevelopment = process.env.NODE_ENV === 'development';
// 1. 出力先ディレクトリを環境に応じて決定
const outputDir = isDevelopment 
  ? 'dist-devel' // 開発用
  : 'dist-prod';  // 公開用 (本番環境に提出するディレクトリ)

module.exports = {
  devtool: "cheap-module-source-map", // または "source-map"
  mode: 'development',
  output: {
    path: path.resolve(__dirname, outputDir),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  entry: {
    settings: './src/app/settings/page.jsx',
    sidepanel: './src/app/sidepanel/page.jsx',
    background: './src/app/backgtound/route.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/app/template.html", 
      filename: "sidepanel.html",
      chunks: ['sidepanel']}),


    new HtmlWebpackPlugin({
      template: "src/app/template.html", 
      filename: "settings.html",
      chunks: ['settings']}),

    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/manifest-master.json', to: "manifest.json",
          transform: (content, path) => {
            // content は manifest.json のバッファ（Buffer）なので、文字列に変換
            const manifest = JSON.parse(content.toString());
            // 🌟 ここで変数を埋め込む 🌟
            // package.json からバージョンを取得して埋め込む
            manifest.version = require('./package.json').version;
            // JSON文字列に戻して返す
            return JSON.stringify(manifest, null, 2);
          },
        },
        
        { from: "public/icons/**/*", to: "[name][ext]" },
        { from: "src/app/content.js", to: "content.js" },

      ],
    }),
  ],
};