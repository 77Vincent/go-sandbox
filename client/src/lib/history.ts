import {StateEffect, StateField, Transaction} from "@codemirror/state";
import {EditorView} from "@codemirror/view";

export const addHistoryEvent = StateEffect.define<{
    pos: number;
    scroll: number;
    doc: string;
    filePath: string;
}>();
// Effects to move back/forward
const prevHistoryEvent = StateEffect.define<null>();
const nextHistoryEvent = StateEffect.define<null>();
const clearHistoryEvent = StateEffect.define<null>();

interface HistoryEntry {
    stack: EntryStackI[]
    index: number;
}

interface EntryStackI {
    pos: number;
    scroll: number;
    doc: string;
    filePath: string;
}

// The field holds the stack and a pointer into it
export const historyField = StateField.define<HistoryEntry>({
    create() {
        return {stack: [], index: -1};
    },
    update(value, tr: Transaction) {
        // If we're adding a new entry
        for (const e of tr.effects) {
            if (e.is(clearHistoryEvent)) {
                return {stack: [], index: -1};
            }
            if (e.is(addHistoryEvent)) {
                // drop any “forward” entries
                const stack = value.stack.slice(0, value.index + 1);
                stack.push(e.value);
                return {stack, index: stack.length - 1};
            }
            if (e.is(prevHistoryEvent) && value.index > 0) {
                return {stack: value.stack, index: value.index - 1};
            }
            if (e.is(nextHistoryEvent) && value.index < value.stack.length - 1) {
                return {stack: value.stack, index: value.index + 1};
            }
        }
        return value;
    },
});

export function historyGoto(view: EditorView | null, index: number) {
    if (!view) {
        return false;
    }

    // first focus the editor
    view.focus();

    const hist = view.state.field(historyField);
    if (index < 0 || index >= hist.stack.length) {
        return false; // nothing to go to
    }
    const entry = hist.stack[index];
    hist.index = index; // update the index in the history field

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
    view.dispatch({
        selection: {anchor: entry.pos},
        scrollIntoView: true,
    });
    view.scrollDOM.scrollTop = entry.scroll;
    return true;
}

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
    view.dispatch({effects: prevHistoryEvent.of(null)});
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
    view.dispatch({effects: nextHistoryEvent.of(null)});
    view.dispatch({
        selection: {anchor: entry.pos},
        scrollIntoView: true,
    });
    view.scrollDOM.scrollTop = entry.scroll;
    return true;
}

export function resetHistory(view: EditorView | null, doc: string, filePath: string) {
    if (!view) {
        return;
    }

    // clear the history first
    view.dispatch({effects: clearHistoryEvent.of(null)});

    // then push the new entry
    view.dispatch({
        effects: addHistoryEvent.of({
            pos: 0,
            scroll: view.scrollDOM.scrollTop,
            doc,
            filePath,
        }),
    });
}

// record the current position in the history
export function recordHistory(view: EditorView | null, filePath: string) {
    if (!view) {
        return;
    }

    view.dispatch({
        effects: addHistoryEvent.of({
            pos: view.state.selection.main.head,
            scroll: view.scrollDOM.scrollTop,
            doc: view.state.doc.toString(),
            filePath,
        }),
    });
}
