export function protectsCodeBlock(state, key) {
  const { selection, doc } = state;
  const { $from, $to, from, to, empty } = selection;
  if (!empty) {
    // Editing text within one code block is allowed; removing its boundary is not.
    if ($from.sameParent($to) && $from.parent.type.name === 'codeBlock' && !selection.node) return false;
    let found = false;
    doc.nodesBetween(from, to, node => { if (node.type.name === 'codeBlock') found = true; });
    return found;
  }
  if ($from.parent.type.name === 'codeBlock') {
    return key === 'Backspace' ? $from.parentOffset === 0 : $from.parentOffset === $from.parent.content.size;
  }
  if (!$from.parent.isTextblock) {
    return (key === 'Backspace' ? $from.nodeBefore : $from.nodeAfter)?.type.name === 'codeBlock';
  }
  const atBoundary = key === 'Backspace' ? $from.parentOffset === 0 : $from.parentOffset === $from.parent.content.size;
  if (!atBoundary) return false;
  for (let depth = $from.depth; depth > 0; depth--) {
    const boundary = doc.resolve(key === 'Backspace' ? $from.before(depth) : $from.after(depth));
    const adjacent = key === 'Backspace' ? boundary.nodeBefore : boundary.nodeAfter;
    if (adjacent?.type.name === 'codeBlock') return true;
    if (adjacent) break;
  }
  return false;
}
