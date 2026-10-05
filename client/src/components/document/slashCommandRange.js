// Inline atoms (child-page links) occupy a document position but have no textContent.
// Preserve those positions when detecting a slash command after a link/line break.
export function slashCommandRange(selection) {
  const { $from, empty } = selection;
  if (!empty || $from.parent.type.name !== 'paragraph') return null;
  const beforeCursor = $from.parent.textBetween(0, $from.parentOffset, '', '\ufffc');
  const match = /(?:^|\ufffc)\/([^/\s]*)$/.exec(beforeCursor);
  if (!match) return null;
  const query = match[1];
  const from = $from.pos - query.length - 1;
  const to = $from.pos;
  const onlyCommand = $from.parent.childCount === 1 && $from.parent.firstChild.isText && from === $from.start() && to === $from.end();
  return { from, to, query, key: `${from}:${to}:${query}`, blockRange: onlyCommand ? { from: $from.before(), to: $from.after() } : { from, to } };
}
