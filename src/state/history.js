// Simple undo/redo stack (max 20)
export function attachHistory(textarea, onApply) {
    const MAX = 20;
    const stack = [];
    let idx = -1;
    let pendingTimer = null;

    function push(state) {
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

    function apply(state) {
        textarea.value = state;
        if (typeof onApply === 'function') onApply();
    }

    function undo() {
        if (idx <= 0) return;
        idx--;
        apply(stack[idx]);
    }

    function redo() {
        if (idx >= stack.length - 1) return;
        idx++;
        apply(stack[idx]);
    }

    function recordSoon() {
        clearTimeout(pendingTimer);
        pendingTimer = setTimeout(() => {
            if (textarea.value !== stack[idx]) push(textarea.value);
        }, 250);
    }

    textarea.addEventListener('input', recordSoon);

    textarea.addEventListener('keydown', (e) => {
        const mod = e.metaKey || e.ctrlKey;
        if (!mod) return;
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if ((e.key.toLowerCase() === 'z' && e.shiftKey) || (e.key.toLowerCase() === 'y')) { e.preventDefault(); redo(); }
    });

    return { undo, redo, canUndo: () => idx > 0, canRedo: () => idx < stack.length - 1 };
}