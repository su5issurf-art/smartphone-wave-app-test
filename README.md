# Sample Beach Surf Check

サンプルビーチ（架空）のスマホ向け波情報Webアプリ。HTML、CSS、JavaScriptだけで動作し、外部API・APIキー・外部フォント・ライブラリへの依存はありません。

## 使い方

`index.html` をブラウザで開いてください。またはこのディレクトリで `python -m http.server 8000` を実行して http://localhost:8000 を開いてください。

- 24時間分の架空予報を横スクロールできます。
- 時間をタップすると評価・波高・周期・波向・風向・風速・潮が切り替わります。
- 日付は日本時間の当日を表示します。予報値は固定のサンプルです。
- 表示データは架空です。実際の海況や安全判断には使用できません。

## 検証

`node --check app.js` で構文確認できます。Playwrightが使える環境では、`node tests/browser.cjs` で、スマホ・PC幅、時間切替、全評価、外部通信の有無、JavaScriptエラーを検証します。テスト用サーバーは自動で起動・終了します。`CHROMIUM_PATH` でブラウザのパスを指定できます（既定: `/usr/bin/chromium`）。
