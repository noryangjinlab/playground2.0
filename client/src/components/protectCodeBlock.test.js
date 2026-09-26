import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSchema } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorState, TextSelection, NodeSelection, AllSelection } from '@tiptap/pm/state';
import { protectsCodeBlock } from './protectCodeBlock.js';

const schema = getSchema([StarterKit]);
const doc = schema.node('doc', null, [
  schema.node('paragraph', null, schema.text('a')),
  schema.node('codeBlock', null, schema.text('abc')),
  schema.node('paragraph', null, schema.text('b')),
]);
const state = selection => EditorState.create({ doc, selection });
test('protects selected code blocks and selections spanning code', () => {
  assert.equal(protectsCodeBlock(state(NodeSelection.create(doc, 3)), 'Delete'), true);
  assert.equal(protectsCodeBlock(state(new AllSelection(doc)), 'Backspace'), true);
});
test('allows deleting characters within code, protects both block boundaries', () => {
  assert.equal(protectsCodeBlock(state(TextSelection.create(doc, 5)), 'Backspace'), false);
  assert.equal(protectsCodeBlock(state(TextSelection.create(doc, 4, 7)), 'Delete'), false);
  assert.equal(protectsCodeBlock(state(TextSelection.create(doc, 4)), 'Backspace'), true);
  assert.equal(protectsCodeBlock(state(TextSelection.create(doc, 7)), 'Delete'), true);
});
test('protects code from adjacent paragraph joins', () => {
  assert.equal(protectsCodeBlock(state(TextSelection.create(doc, 2)), 'Delete'), true);
  assert.equal(protectsCodeBlock(state(TextSelection.create(doc, 9)), 'Backspace'), true);
});
test('protects an empty code block', () => {
  const empty = schema.node('doc', null, [schema.node('codeBlock')]);
  const selected = EditorState.create({ doc: empty, selection: TextSelection.create(empty, 1) });
  assert.equal(protectsCodeBlock(selected, 'Backspace'), true);
  assert.equal(protectsCodeBlock(selected, 'Delete'), true);
});
