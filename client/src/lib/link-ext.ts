import {ViewPlugin, Decoration, DecorationSet, EditorView} from "@codemirror/view";
import {MutableRefObject} from "react";
import {LSPClient} from "./lsp.ts";

export function createHoverLink(
    lsp: LSPClient | null,
    metaKey: MutableRefObject<boolean>,
) {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet = Decoration.none;

        constructor(readonly view: EditorView) {
            view.dom.addEventListener("click", this.onClick);
        }

        destroy() {
            this.view.dom.removeEventListener("click", this.onClick);
        }

        onClick = async () => {
            if (!lsp || !metaKey.current) {
                return
            }
            await lsp.loadDefinition();
        };

        update() {
        }

    }, {
        decorations: plugin => plugin.decorations
    });
}
