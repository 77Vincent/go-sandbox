import {hoverTooltip, Tooltip} from "@codemirror/view";
import {LSPClient} from "./lsp.ts";
import {marked} from "marked";
import hljs from 'highlight.js';
import goLang from "highlight.js/lib/languages/go";
import "highlight.js/styles/github-dark.css";

const language = "go";
hljs.registerLanguage(language, goLang);

marked.use({
    renderer: {
        code(code) {
            if (code.codeBlockStyle) {
                return `<pre class="dark:bg-gray-800 bg-gray-200 py-1 px-2 rounded">${code.text}</pre>`;
            }
            if (code.lang || isCodeBlock(code.raw)) {
                const {value} = hljs.highlight(code.text, {language: code.lang || language});
                return `<pre class="dark:bg-gray-800 bg-gray-200 py-1 px-2 rounded"><code>${value}</code></pre>`;
            }

            return code.text;
        }
    }
});

function isCodeBlock(code: string) {
    return code.startsWith("```") && code.endsWith("```");
}

export function createHoverTooltip(lsp: LSPClient | null) {
    return hoverTooltip(async (view, pos) => {
        if (!lsp) return null;

        const line = view.state.doc.lineAt(pos);
        const row = line.number - 1;  // LSP is 0-indexed
        const col = pos - line.from;

        try {
            const res = await lsp.hover(row, col);
            if (!res) return null;

            const {contents} = res;
            if (!contents) return null;

            return {
                pos,
                end: pos,
                above: true,
                create() {
                    const dom = document.createElement("div");
                    dom.className = "markdown-wrapper p-3 z-0 max-w-2xl max-h-96 overflow-auto shadow border border-gray-300 dark:border-gray-600";

                    const markdown = Array.isArray(contents)
                        ? contents.map((v) => v.value).join("")
                        : contents.value;

                    dom.innerHTML = marked.parse(markdown) as string
                    return {dom};
                }
            } as Tooltip;

        } catch (e) {
            console.error("Hover LSP failed", e);
            return null;
        }
    })
}
