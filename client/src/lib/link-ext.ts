import { ViewPlugin, Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { MutableRefObject } from "react";
import {LSPClient} from "./lsp.ts";
import {getCursorPos, posToHead} from "../utils.ts";
import {fetchSourceCode} from "../api/api.ts";
import {SessionI} from "../modules/Sessions.tsx";

export function createHoverLink(
    lsp: LSPClient | null,
    file: MutableRefObject<string>,
    sessions: MutableRefObject<SessionI[]>,
    metaKey: MutableRefObject<boolean>,
) {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet = Decoration.none;
        hovered: { from: number; to: number } | null = null;

        constructor(readonly view: EditorView) {
            view.dom.addEventListener("mousemove", this.onMouseMove);
            view.dom.addEventListener("mouseleave", this.clearHover);
            view.dom.addEventListener("click", this.onClick);
        }

        destroy() {
            this.view.dom.removeEventListener("mousemove", this.onMouseMove);
            this.view.dom.removeEventListener("mouseleave", this.clearHover);
            this.view.dom.removeEventListener("click", this.onClick);
        }

        onMouseMove = (e: MouseEvent) => {
            if (!metaKey.current) {
                this.clearHover();
                return;
            }

            const pos = this.view.posAtCoords({ x: e.clientX, y: e.clientY });
            const word = pos != null ? this.view.state.wordAt(pos) : null;

            if (!word) {
                this.clearHover();
                return;
            }

            if (this.hovered && this.hovered.from === word.from && this.hovered.to === word.to) return;

            this.hovered = { from: word.from, to: word.to };
            const builder = new RangeSetBuilder<Decoration>();
            const deco = Decoration.mark({ class: "cm-token-link" });
            builder.add(word.from, word.to, deco);
            this.decorations = builder.finish();
            this.view.dispatch({ effects: [] });
        };

        onClick = async () => {
            if (metaKey.current && this.hovered) {
                if (!lsp) return;
                const {row: currentRow, col: currentCol} = getCursorPos(lsp.view);
                const definitions = await lsp.getDefinition(currentRow - 1, currentCol - 1, file.current);

                // quit if no definition
                if (!definitions.length) {
                    return
                }

                const path = decodeURIComponent(definitions[0].uri);
                file.current = path; // update file immediately

                const {is_main, error, content} = await fetchSourceCode(path, lsp.goVersion);
                const {range: {start: {line, character}}} = definitions[0];
                const row = line + 1; // 1-based index
                const col = character + 1; // 1-based index

                if (error) {
                    // setToastError(error);
                    return;
                }
                if (is_main) {
                    lsp.view.dispatch({
                        selection: {
                            anchor: posToHead(lsp.view, row, col), // 1-based index
                        },
                        scrollIntoView: true,
                    })
                }
                if (content) {
                    // update the doc first
                    lsp.view.dispatch({
                        changes: {
                            from: 0,
                            to: lsp.view.state.doc.length,
                            insert: content
                        },
                    });
                    // then move the cursor
                    lsp.view.dispatch({
                        selection: {
                            anchor: posToHead(lsp.view, row, col), // 1-based index
                        },
                        scrollIntoView: true,
                    })

                    // update the sessions
                    const data = {id: path, cursor: posToHead(lsp.view, row, col), data: content}
                    const index = sessions.current.findIndex((s) => s.id === path)
                    if (index == -1) {
                        sessions.current.push(data) // not in the list
                    } else {
                        sessions.current[index] = data // update the item in the list
                    }
                    lsp.view.focus()
                }
            }
        };

        clearHover = () => {
            if (this.decorations.size > 0) {
                this.decorations = Decoration.none;
                this.view.dispatch({ effects: [] });
            }
            this.hovered = null;
        };

        update() {}

    }, {
        decorations: plugin => plugin.decorations
    });
}
