// webpack.config.js
const fs = require("fs");
const nodePath = require("path");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

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
  mode: environment === "production" ? "production" : "development",
  output: {
    path: nodePath.resolve(__dirname, outputDir),
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
    content: './src/app/content/content.js',
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
          transform: (content, resourcePath) => {
            const pkg = require("./package.json");
            const manifest = JSON.parse(content.toString());
            // platform diff
            const platformManifestPath = nodePath.resolve(
              __dirname,
              `public/manifests/${platform}.json`
            );
            if (!fs.existsSync(platformManifestPath)) {
              throw new Error(`Missing manifest diff: ${platform}.json`);
            }

            const platformManifest = JSON.parse(
              fs.readFileSync(platformManifestPath, "utf-8")
            );

            // merge
            const merged = deepMerge(manifest, platformManifest);

            // 🌟 ここで変数を埋め込む 🌟
            // package.json からバージョンを取得して埋め込む
              merged.version = pkg.version;
              merged.name = pkg.name;
              merged.description = pkg.description;
            // JSON文字列に戻して返す
            return JSON.stringify(merged, null, 2);
          },
        },

        { from: "public/icons/**/*", to: "[name][ext]" },
        // { from: "src/app/content.js", to: "content.js" },

      ],
    }),
  ],
};