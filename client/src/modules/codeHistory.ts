import {StateEffect, StateField, Transaction} from "@codemirror/state";
import {EditorView} from "@codemirror/view";

export const addHistory = StateEffect.define<{
    pos: number;
    scroll: number;
    doc: string;
    filePath: string;
}>();
// Effects to move back/forward
const prevHistory = StateEffect.define<null>();
const nextHistory = StateEffect.define<null>();

// The field holds the stack and a pointer into it
export const historyField = StateField.define<{
    stack: { pos: number; scroll: number; doc: string; filePath: string }[];
    index: number;
}>({
    create() {
        return {stack: [], index: -1};
    },
    update(value, tr: Transaction) {
        // If we're adding a new entry
        for (const e of tr.effects) {
            if (e.is(addHistory)) {
                // drop any “forward” entries
                const stack = value.stack.slice(0, value.index + 1);
                stack.push(e.value);
                return {stack, index: stack.length - 1};
            }
            if (e.is(prevHistory) && value.index > 0) {
                return {stack: value.stack, index: value.index - 1};
            }
            if (e.is(nextHistory) && value.index < value.stack.length - 1) {
                return {stack: value.stack, index: value.index + 1};
            }
        }
        return value;
    },
});

export function historyBack(view: EditorView | null) {
    if (!view) {
        return false;
    }

    // first focus the editor
    view.focus();

    const hist = view.state.field(historyField);
    if (hist.index <= 0) {
        return false; // nothing to go back to
    }
    const entry = hist.stack[hist.index - 1];

    // 1) swap in the old document if needed
    if (view.state.doc.toString() !== entry.doc) {
        view.dispatch({
            changes: {
                from: 0,
                to: view.state.doc.length,
                insert: entry.doc
            }
        });
    }

    // 2) move the cursor and scroll
    view.dispatch({effects: prevHistory.of(null)});
    view.dispatch({
        selection: {anchor: entry.pos},
        scrollIntoView: true,
    });
    view.scrollDOM.scrollTop = entry.scroll;
    return true;
}

export function historyForward(view: EditorView | null) {
    // view is null when the editor is not mounted
    if (!view) {
        return false;
    }

    // first focus the editor
    view.focus();

    const hist = view.state.field(historyField);
    if (hist.index >= hist.stack.length - 1) {
        return false; // nothing to go forward to
    }
    const entry = hist.stack[hist.index + 1];

    // 1) swap in the old document if needed
    if (view.state.doc.toString() !== entry.doc) {
        view.dispatch({
            changes: {
                from: 0,
                to: view.state.doc.length,
                insert: entry.doc
            }
        });
    }

    // 2) move the cursor and scroll
    view.dispatch({effects: nextHistory.of(null)});
    view.dispatch({
        selection: {anchor: entry.pos},
        scrollIntoView: true,
    });
    view.scrollDOM.scrollTop = entry.scroll;
    return true;
}

export function recordPosition(view: EditorView, filePath: string) {
    view.dispatch({
        effects: addHistory.of({
            pos: view.state.selection.main.head,
            scroll: view.scrollDOM.scrollTop,
            doc: view.state.doc.toString(),
            filePath: filePath,
        }),
    });
}
