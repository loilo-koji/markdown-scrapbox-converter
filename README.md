# Markdown-Scrapbox Converter

Markdownとスクラップボックス記法を相互変換するChrome拡張機能です。Cline+Claude Sonnet 3.7によって作成されました。

![スクリーンショット](/images/screenshot.png)

## 概要

このツールは、Markdown形式の文章をScrapbox記法に、またはその逆に変換することができます。翻訳ツールのような左右に分かれたインターフェースで、片方に入力すると自動的にもう片方に変換結果が表示されます。

## 特徴

- **リアルタイム変換**: 入力と同時に変換が行われます
- **双方向変換**: MarkdownからScrapboxへ、またはScrapboxからMarkdownへの変換が可能
- **Chromeの新規タブで動作**: 拡張アイコンをクリックすると新規タブで開きます
- **複数の太字が正しく変換**: 同一行内に複数の太字要素があっても正確に変換

## 変換対応表

> 注: この変換ツールで使用しているScrapbox記法はLoiLo社内で使われている仕様になっています。別の記法に変更したい場合は、このリポジトリをforkして、AIに変更を依頼してください。

### Markdownからスクラップボックスへの変換

1. 見出しレベル1（タイトル等）
   - Markdown: `# 見出し`  
   - Scrapbox: `[**** 見出し]`

2. 見出しレベル2（章の区切り等）
   - Markdown: `## 見出し`  
   - Scrapbox: `[**~ 見出し]`
   
3. 見出しレベル3（小見出し）
   - Markdown: `### 見出し`  
   - Scrapbox: `[*%+ 見出し]`
    
4. 見出しレベル4（文章中の項目名）
   - Markdown: `#### 見出し`  
   - Scrapbox: `[* 見出し]`

5. 箇条書き  
   - Markdown: `- 項目`  
   - Scrapbox: （行頭にスペースを追加して） `項目`

6. 太字  
   - Markdown: `**太字**`  
   - Scrapbox: `[* 太字]`

7. 斜体  
   - Markdown: `*斜体*` または `_斜体_`  
   - Scrapbox: `[/ 斜体]`

8. 取り消し線  
   - Markdown: `~~取り消し線~~`  
   - Scrapbox: `[- 取り消し線]`

9. リンク  
   - Markdown: `[リンクテキスト](URL)`  
   - Scrapbox: `[リンクテキスト URL]`

10. 画像  
    - Markdown: `![画像テキスト](画像URL)`  
    - Scrapbox: `[画像URL]`

## インストール方法

### Chrome ウェブストアからインストール

1. [Chrome ウェブストア](#)からインストール（リンクは公開後更新）

### 手動インストール

1. このリポジトリをクローンまたはダウンロード
2. Chromeで `chrome://extensions` を開く
3. 右上の「デベロッパーモード」をオンにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. ダウンロードしたフォルダを選択

## 使い方

1. Chromeのツールバーにある拡張機能のアイコンをクリック
2. 左側の「Markdown」エリアにMarkdownテキストを入力すると、右側に自動的にScrapbox記法に変換されたテキストが表示されます
3. 右側の「Scrapbox」エリアにScrapbox記法のテキストを入力すると、左側に自動的にMarkdown形式に変換されたテキストが表示されます
4. 変換されたテキストはコピーボタンでクリップボードにコピーできます

## 開発

このプロジェクトはHTML、CSS、JavaScriptで構築されています。Chrome拡張機能として動作し、特別な依存関係はありません。

### プロジェクト構造

- `manifest.json` - 拡張機能の設定ファイル
- `background.js` - バックグラウンドスクリプト
- `index.html` - メインのユーザーインターフェース
- `script.js` - 変換ロジックを含むメインスクリプト
- `style.css` - スタイルシート
- `icons/` - アイコン画像

## ライセンス

[MITライセンス](https://opensource.org/licenses/MIT)

```
Copyright (c) 2025 Koji Sugiyama

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 作者

杉山浩二 (Koji Sugiyama)
