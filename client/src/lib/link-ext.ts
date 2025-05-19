import {ViewPlugin, Decoration, DecorationSet, EditorView} from "@codemirror/view";
import {MutableRefObject} from "react";

export function createHoverLink(
    seeDefinition: () => boolean,
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
            if (metaKey.current) {
                seeDefinition()
            }
        };

        update() {
        }

    }, {
        decorations: plugin => plugin.decorations
    });
}
