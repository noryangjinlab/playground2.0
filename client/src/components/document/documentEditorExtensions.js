import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import DragHandle from '@tiptap/extension-drag-handle';
import { protectsCodeBlock } from './protectCodeBlock';

export const DocumentDragHandle = DragHandle.configure({
  render: () => {
    const handle = document.createElement('div');
    handle.className = 'explorer-block-handle';
    handle.textContent = '⋮⋮'; handle.title = '드래그해서 블록 이동';
    handle.setAttribute('aria-label', '블록 이동');
    return handle;
  },
  computePositionConfig: { placement: 'left-start', strategy: 'absolute' },
});

export const DocumentBehavior = Extension.create({
  name: 'documentBehavior', priority: 1000,
  addOptions() { return { onFiles: () => {}, onAttachments: () => {} }; },
  addProseMirrorPlugins() {
    const editor = this.editor;
    const onFiles = this.options.onFiles;
    const onAttachments = this.options.onAttachments;
    return [new Plugin({ props: {
      handleKeyDown(view, event) {
        if (!editor.isEditable || !['Backspace', 'Delete'].includes(event.key)) return false;
        if (!protectsCodeBlock(view.state, event.key)) return false;
        event.preventDefault(); return true;
      },
      handleDOMEvents: {
        beforeinput(view, event) {
          if (!editor.isEditable || !event.inputType?.startsWith('delete')) return false;
          const key = event.inputType.includes('Backward') ? 'Backspace' : 'Delete';
          if (!protectsCodeBlock(view.state, key)) return false;
          event.preventDefault(); return true;
        },
      },
      handlePaste(view, event) {
        if (!editor.isEditable) return false;
        const clipboard = event.clipboardData;
        const files = Array.from(clipboard?.files || []).filter(file => file.type.startsWith('image/'));
        if (files.length) {
          event.preventDefault(); onFiles(files, { from: view.state.selection.from, to: view.state.selection.to }); return true;
        }
        const { $from } = view.state.selection;
        const html = clipboard?.getData('text/html') || '';
        if ($from.parent.isTextblock && $from.parent.type.name !== 'codeBlock' && /<pre\b/i.test(html)) {
          const text = clipboard?.getData('text/plain') || '';
          if (!text) return false;
          event.preventDefault();
          view.dispatch(view.state.tr.insertText(text).scrollIntoView());
          return true;
        }
        return false;
      },
      handleDrop(view, event, _slice, moved) {
        if (!editor.isEditable || moved) return false;
        const files = Array.from(event.dataTransfer?.files || []);
        if (!files.length) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.from;
        onAttachments(files, { from: pos, to: pos }); return true;
      },
    } })];
  },
});
