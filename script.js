document.addEventListener('DOMContentLoaded', () => {
    const markdownEditor = document.getElementById('markdown-editor');
    const scrapboxEditor = document.getElementById('scrapbox-editor');

    // コピーボタンの処理
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const textarea = document.getElementById(targetId);
            textarea.select();
            document.execCommand('copy');
            
            // コピー成功のフィードバック
            const icon = button.querySelector('.material-icons');
            const originalText = icon.textContent;
            icon.textContent = 'check';
            button.style.backgroundColor = '#28a745';
            button.querySelector('.material-icons').style.color = '#fff';
            
            setTimeout(() => {
                icon.textContent = originalText;
                button.style.backgroundColor = '';
                button.querySelector('.material-icons').style.color = '';
            }, 2000);
        });
    });

    // クリアボタンの処理
    document.querySelectorAll('.clear-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const textarea = document.getElementById(targetId);
            textarea.value = '';
            textarea.focus();
        });
    });

    // Markdownの前処理を行う関数
    function cleanMarkdown(markdown) {
        if (!markdown) return '';
        
        // 1. HTMLエンティティの変換
        // &gt; を > に変換
        let cleaned = markdown.replace(/&gt;/g, '>');
        // 必要に応じて他のHTMLエンティティも変換
        cleaned = cleaned.replace(/&lt;/g, '<');
        cleaned = cleaned.replace(/&amp;/g, '&');
        cleaned = cleaned.replace(/&quot;/g, '"');
        cleaned = cleaned.replace(/&#39;/g, "'");
        
        // 2. リンク内の改行を処理
        // リンクテキスト内の改行を空白に置換
        cleaned = cleaned.replace(/\[\s*([^[\]]*?)\s*\]/g, (match, linkText) => {
            return `[${linkText.replace(/\n/g, ' ').trim()}]`;
        });
        
        // 3. 入力の正規化
        // 連続した空白行を1行に削除
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        
        // 行末の空白を削除
        cleaned = cleaned.replace(/[ \t]+$/gm, '');
        
        return cleaned;
    }
    
    // URLからドメイン名を抽出する関数
    function extractDomain(url) {
        try {
            // URLからホスト名（ドメイン）を抽出
            const hostname = new URL(url).hostname;
            // www. で始まる場合は除去
            return hostname.replace(/^www\./, '');
        } catch (e) {
            // 無効なURLの場合はそのまま返す
            console.error('Invalid URL:', url, e);
            return url;
        }
    }
    
    // Markdown to Scrapbox conversion
    function convertToScrapbox(markdown) {
        // 前処理：Markdownをクリーニング
        markdown = cleanMarkdown(markdown);
        
        // コードブロックの処理
        // ```で囲まれたコードブロックを検出して変換
        const codeBlockRegex = /```(?:([\w-]+)\n)?([\s\S]*?)```/g;
        markdown = markdown.replace(codeBlockRegex, (match, language, code) => {
            // 言語が指定されている場合は、ファイル名として使用
            // 言語が指定されていない場合は、codeをファイル名として使用
            const fileName = language ? `code: ${language}` : 'code: code';
            
            // コードの各行の先頭にスペースを追加
            const formattedCode = code.trim().split('\n').map(line => ` ${line}`).join('\n');
            
            return `${fileName}\n${formattedCode}`;
        });
        
        // 表の処理
        // Markdownの表を検出して変換
        let inTable = false;
        let tableRows = [];
        let tableTitle = '表';
        
        // 通常の変換処理
        // 行ごとに処理
        const lines = markdown.split('\n');
        const resultLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // 表の開始行を検出（|で始まり|で終わる行）
            if (line.match(/^\|(.+)\|$/)) {
                // 表の中にまだ入っていない場合は、新しい表の開始
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                    
                    // 表のタイトルを取得（前の行がある場合）
                    if (i > 0 && lines[i-1].trim() && !lines[i-1].startsWith('|')) {
                        tableTitle = lines[i-1].trim();
                        // 前の行が表のタイトルだった場合、結果から削除
                        if (resultLines.length > 0) {
                            resultLines.pop();
                        }
                    }
                }
                
                // 区切り行（|---|---|など）はスキップ
                if (line.match(/^\|[\s-:]*\|[\s-:]*\|/)) {
                    continue;
                }
                
                // 表の行を処理
                const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
                tableRows.push(cells);
                continue;
            } else if (inTable) {
                // 表の終了
                inTable = false;
                
                // Scrapbox形式の表に変換
                resultLines.push(`table: ${tableTitle}`);
                
                // ヘッダー行
                if (tableRows.length > 0) {
                    const headerRow = tableRows[0];
                    resultLines.push(` ${headerRow.join('\t')}`);
                    
                    // データ行
                    for (let j = 1; j < tableRows.length; j++) {
                        resultLines.push(` ${tableRows[j].join('\t')}`);
                    }
                }
                
                // 現在の行も処理
                i--; // 現在の行を再処理
                continue;
            }
            
            // 見出しの処理
            if (line.match(/^#{1,4} /)) {
                const headingLevel = line.match(/^(#{1,4}) /)[1].length;
                let prefix;
                switch (headingLevel) {
                    case 1: prefix = '****'; break;
                    case 2: prefix = '**~'; break;
                    case 3: prefix = '*%+'; break;
                    case 4: prefix = '*'; break;
                }
                
                // 見出しの内容を取得
                let content = line.substring(headingLevel + 1).trim();
                
                // 完全な太字の見出しの場合
                if (content.startsWith('**') && content.endsWith('**') && !content.slice(2, -2).includes('**')) {
                    content = content.slice(2, -2).trim();
                    resultLines.push(`[${prefix} ${content}]`);
                } else {
                    // 部分的な太字や複数の太字を含む見出しの場合
                    content = processInlineFormatting(content);
                    resultLines.push(`[${prefix} ${content}]`);
                }
                continue;
            }
            
            // 箇条書きの処理（スペースまたはタブ区切り）
            if (line.match(/^-[ \t]+/)) {
                const content = line.replace(/^-[ \t]+/, '').trim();
                resultLines.push(` ${processInlineFormatting(content)}`);
                continue;
            }
            
            // 数字の箇条書きの処理
            if (line.match(/^\d+\.[ \t]+/)) {
                const content = line.replace(/^\d+\.[ \t]+/, '').trim();
                const number = line.match(/^(\d+)\./)[1];
                resultLines.push(` ${number}. ${processInlineFormatting(content)}`);
                continue;
            }
            
            // 通常の行
            resultLines.push(processInlineFormatting(line));
        }
        
        // 最後が表で終わっている場合の処理
        if (inTable) {
            // Scrapbox形式の表に変換
            resultLines.push(`table: ${tableTitle}`);
            
            // ヘッダー行
            if (tableRows.length > 0) {
                const headerRow = tableRows[0];
                resultLines.push(` ${headerRow.join('\t')}`);
                
                // データ行
                for (let j = 1; j < tableRows.length; j++) {
                    resultLines.push(` ${tableRows[j].join('\t')}`);
                }
            }
        }
        
        return resultLines.join('\n');
    }
    
    // インライン装飾を処理する関数
    function processInlineFormatting(text) {
        // 0. 太字を最初に処理（最も優先度が高い）
        text = processBold(text);

        // 1. 括弧で囲まれたリンク記法 - ([text](url)) 形式
        text = text.replace(/\(\[\s*([^[\]]*?)\s*\]\(([^)]+?)\)\)/g, (match, linkText, url) => {
            // URLからドメイン名を抽出
            const domain = extractDomain(url.trim());
            // ドメイン名をリンクテキストとして使用
            return `[${domain} ${url.trim()}]`;
        });
        
        // 2. 画像の処理 - ![alt](url) 形式
        text = text.replace(/!\[([^\]]*?)\]\(([^)]+?)\)/g, (match, alt, url) => {
            return `[${url.trim()}]`;
        });
        
        // 3. 通常のリンク処理 - [text](url) 形式
        text = text.replace(/\[\s*([^[\]]*?)\s*\]\(([^)]+?)\)/g, (match, linkText, url) => {
            // 空のリンクテキストの場合は「link」というテキストを使用
            // 改行を空白に置換
            const cleanText = linkText.replace(/\n/g, ' ').trim() || 'link';
            // リンクテキストを使用
            return `[${cleanText} ${url.trim()}]`;
        });
        
        // 4. 斜体の処理 - すでに変換済みの太字を保護
        text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)|_([^_\n]+?)_/g, (match, p1, p2) => {
            // すでに変換された[* ]を含む場合は処理しない
            if (text.includes('[* ')) {
                return match;
            }
            
            // 通常の斜体処理
            const content = (p1 || p2 || '').trim();
            return `[/ ${content}]`;
        });

        // ここで完全なパターンチェック: [* text] が [/ text] に誤変換されるのを防ぐ
        if (text.includes('[[/ ') && text.includes('] []')) {
            // 誤って変換された太字を修復
            text = text.replace(/\[\[\/\s([^\]]+?)\]\s\[\]\s([^\]]+?)\]/g, '[* $1] [* $2]');
        }
        
        // 5. 取り消し線の処理
        text = text.replace(/~~([^~\n]+?)~~/g, (match, p1) => {
            return `[- ${p1.trim()}]`;
        });
        
        return text;
    }
    
    // 太字を処理する関数 - 正規表現ベースの処理
    function processBold(text) {
        // **text** パターンをグローバルに検索して置換
        // .*?を使用することで、*を含むテキストや複数行テキストも処理可能
        return text.replace(/\*\*(.*?)\*\*/g, (match, content) => {
            return `[* ${content.trim()}]`;
        });
    }

    // Scrapbox to Markdown conversion
    function convertToMarkdown(scrapbox) {
        let markdown = scrapbox;
        
        // 表の処理
        // table: で始まる行とそれに続くインデントされた行を検出
        const tableRegex = /(table:[ \t]*([^\n]*)\n)((?:[ \t]+[^\n]*\n?)+)/g;
        markdown = markdown.replace(tableRegex, (match, tableLine, tableTitle, tableContent) => {
            // 表のタイトル
            let result = `${tableTitle.trim()}\n\n`;
            
            // 表の内容を行ごとに分割
            const rows = tableContent.trim().split('\n').map(line => line.trim());
            
            if (rows.length === 0) {
                return result;
            }
            
            // ヘッダー行
            const headerCells = rows[0].split('\t');
            result += '| ' + headerCells.join(' | ') + ' |\n';
            
            // 区切り行
            result += '| ' + headerCells.map(() => '------').join(' | ') + ' |\n';
            
            // データ行
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].split('\t');
                result += '| ' + cells.join(' | ') + ' |\n';
            }
            
            return result;
        });
        
        // コードブロックの処理
        // code: で始まる行とそれに続くインデントされた行を検出
        const codeBlockRegex = /(code:[ \t]*([^\n]*)\n)((?:[ \t]+[^\n]*\n?)+)/g;
        markdown = markdown.replace(codeBlockRegex, (match, codeLine, language, codeContent) => {
            // 言語が指定されている場合は、```の後に言語を追加
            // codeの場合は言語指定なしとして扱う
            const langPrefix = language.trim() && language.trim() !== 'code' ? `\`\`\`${language.trim()}\n` : '```\n';
            
            // コードの各行の先頭のスペースを削除
            const formattedCode = codeContent.split('\n')
                .map(line => line.replace(/^[ \t]+/, ''))
                .filter(line => line.length > 0)
                .join('\n');
            
            return `${langPrefix}${formattedCode}\n\`\`\``;
        });
        
        // 見出しの処理
        markdown = markdown.replace(/\[\*\*\*\* ([^\]]+?)\]/g, '# $1');
        markdown = markdown.replace(/\[\*\*~ ([^\]]+?)\]/g, '## $1');
        markdown = markdown.replace(/\[\*%\+ ([^\]]+?)\]/g, '### $1');
        
        // 見出しレベル4と太字の区別
        markdown = markdown.replace(/\[\* ([^\]]+?)\](?!\()/g, (match, content) => {
            // 行の先頭にある場合は見出しレベル4として処理
            if (markdown.lastIndexOf('\n', markdown.indexOf(match)) === markdown.indexOf(match) - 1 || 
                markdown.indexOf(match) === 0) {
                return `#### ${content}`;
            }
            // それ以外は太字として処理
            return `**${content}**`;
        });
        
        // 数字の箇条書きの処理
        markdown = markdown.replace(/^ (\d+)\. (.+)$/gm, '$1. $2');
        
        // 通常の箇条書きの処理
        markdown = markdown.replace(/^ ([^0-9].+)$/gm, '- $1');
        
        // インライン装飾の処理（見出しと箇条書き以外）
        markdown = markdown.replace(/\[\/ ([^\]]+?)\]/g, '*$1*');
        markdown = markdown.replace(/\[\- ([^\]]+?)\]/g, '~~$1~~');
        
        // リンクと画像の処理
        markdown = markdown.replace(/\[([^\]]+?) (https?:\/\/[^\s\]]+)\]/g, '[$1]($2)');
        markdown = markdown.replace(/\[(https?:\/\/[^\]]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\]]*)?|[^\]]+?\.(?:jpg|jpeg|png|gif|webp))\]/g, '![]($1)');
        
        return markdown;
    }

    // Event listeners for real-time conversion
    markdownEditor.addEventListener('input', () => {
        scrapboxEditor.value = convertToScrapbox(markdownEditor.value);
    });

    scrapboxEditor.addEventListener('input', () => {
        markdownEditor.value = convertToMarkdown(scrapboxEditor.value);
    });
});
