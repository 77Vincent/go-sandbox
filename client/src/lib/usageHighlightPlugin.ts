import { DecorationSet, Decoration, EditorView } from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

// Effect to set new usage decorations
export const setUsageHighlights = StateEffect.define<DecorationSet>();

export const usageHighlightField = StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update(highlights, tr) {
        for (const e of tr.effects) {
            if (e.is(setUsageHighlights)) return e.value;
        }
        if (tr.docChanged) return Decoration.none;
        return highlights;
    },
    provide: f => EditorView.decorations.from(f),
});
