// Simple undo/redo stack (max 20)

export interface HistoryStack {
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
}

export function attachHistory(textarea: HTMLTextAreaElement, onApply?: () => void): HistoryStack {
    const MAX = 20;
    const stack: string[] = [];
    let idx = -1;
    let pendingTimer: number | null = null;

    function push(state: string): void {
        if (stack[idx] === state) return;
        stack.splice(idx + 1);
        stack.push(state);
        if (stack.length > MAX) {
            stack.shift();
        } else {
            idx++;
        }
    }

    push(textarea.value);

    function apply(state: string): void {
        textarea.value = state;
        if (typeof onApply === 'function') onApply();
    }

    function undo(): void {
        if (idx <= 0) return;
        idx--;
        apply(stack[idx]);
    }

    function redo(): void {
        if (idx >= stack.length - 1) return;
        idx++;
        apply(stack[idx]);
    }

    function recordSoon(): void {
        if (pendingTimer !== null) {
            clearTimeout(pendingTimer);
        }
        pendingTimer = window.setTimeout(() => {
            if (textarea.value !== stack[idx]) push(textarea.value);
        }, 250);
    }

    textarea.addEventListener('input', recordSoon);

    textarea.addEventListener('keydown', (e: KeyboardEvent) => {
        const mod = e.metaKey || e.ctrlKey;
        if (!mod) return;
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo(); }
    });

    return { undo, redo, canUndo: () => idx > 0, canRedo: () => idx < stack.length - 1 };
}
