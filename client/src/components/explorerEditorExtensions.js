import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import DragHandle from '@tiptap/extension-drag-handle';
import { protectsCodeBlock } from './protectCodeBlock';

export const ExplorerDragHandle = DragHandle.configure({
  render: () => {
    const handle = document.createElement('div');
    handle.className = 'explorer-block-handle';
    handle.textContent = '⋮⋮'; handle.title = '드래그해서 블록 이동';
    handle.setAttribute('aria-label', '블록 이동');
    return handle;
  },
  computePositionConfig: { placement: 'left-start', strategy: 'absolute' },
});

export const ExplorerBehavior = Extension.create({
  name: 'explorerBehavior', priority: 1000,
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
        const files = Array.from(event.clipboardData?.files || []).filter(file => file.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault(); onFiles(files, { from: view.state.selection.from, to: view.state.selection.to }); return true;
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
