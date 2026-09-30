// Use real block atoms in Explorer; keep the shared storage format compatible
// with the legacy editor through serializeChildPageBlocks below.
export function splitChildPageParagraph(node) {
  if (node.type !== 'paragraph' || !node.content?.some(child => child.type === 'childNote')) return [node];
  const result = [];
  let text = [];
  const flush = () => {
    if (text.length) result.push({ ...node, content: text });
    text = [];
  };
  for (const child of node.content) {
    if (child.type === 'childNote') {
      flush(); result.push({ type: 'childPageBlock', attrs: { ...child.attrs } });
    } else text.push(child);
  }
  flush();
  return result;
}

export function normalizeChildPageBlocks(node) {
  if (!node || !Array.isArray(node.content)) return node;
  const content = node.content.flatMap(child => splitChildPageParagraph(normalizeChildPageBlocks(child)));
  if (node.type === 'listItem' && content[0]?.type !== 'paragraph') content.unshift({ type: 'paragraph' });
  return { ...node, content };
}

export function serializeChildPageBlocks(node) {
  if (!node) return node;
  if (node.type === 'childPageBlock') return { type: 'paragraph', content: [{ type: 'childNote', attrs: { ...node.attrs } }] };
  if (!Array.isArray(node.content)) return node;
  return { ...node, content: node.content.map(serializeChildPageBlocks) };
}
