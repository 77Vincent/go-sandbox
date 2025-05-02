import { ViewPlugin, Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { MutableRefObject } from "react";
import {LSPClient} from "./lsp.ts";

export function createHoverLink(
    lsp: LSPClient | null,
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
            if (!lsp) return;
            if (!metaKey.current || !this.hovered) {
                return
            }
            await lsp.loadDefinition();
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
