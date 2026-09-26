import { useEditorState } from '@tiptap/react';

function colorHex(value) {
  if (/^#[\da-f]{6}$/i.test(value || '')) return value;
  if (/^#[\da-f]{3}$/i.test(value || '')) return '#' + value.slice(1).split('').map(c => c + c).join('');
  const rgb = value?.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return rgb ? '#' + rgb.slice(1).map(n => Number(n).toString(16).padStart(2, '0')).join('') : '#000000';
}

export default function EditorToolbar({ editor, editable }) {
  const state = useEditorState({ editor, selector: ({ editor: current }) => {
    const style = current?.getAttributes('textStyle') || {};
    return {
      bold: current?.isActive('bold'), italic: current?.isActive('italic'), underline: current?.isActive('underline'),
      bullet: current?.isActive('bulletList'), ordered: current?.isActive('orderedList'),
      size: style.fontSize || '14px', color: colorHex(style.color),
      undo: current?.can().undo(), redo: current?.can().redo(),
    };
  } });
  if (!state) return null;
  const button = (label, title, active, run, available = true) => <button type="button" title={title} aria-label={title}
    aria-pressed={active} disabled={!editable || !available} onMouseDown={event => event.preventDefault()}
    onClick={() => run(editor.chain().focus()).run()}>{label}</button>;
  const sizes = [...new Set(['12px', '14px', '16px', '18px', '24px', '32px', state.size])];
  return <div className="explorer-formatbar" role="toolbar" aria-label="텍스트 서식">
    {button('↶', '실행 취소', undefined, chain => chain.undo(), state.undo)}
    {button('↷', '다시 실행', undefined, chain => chain.redo(), state.redo)}
    <span className="explorer-separator"/>
    {button(<b>B</b>, '굵게', state.bold, chain => chain.toggleBold())}
    {button(<i>I</i>, '기울임', state.italic, chain => chain.toggleItalic())}
    {button(<u>U</u>, '밑줄', state.underline, chain => chain.toggleUnderline())}
    <label className="explorer-color" title="텍스트 색"><span style={{ borderBottomColor: state.color }}>A</span>
      <input type="color" aria-label="텍스트 색" disabled={!editable} value={state.color} onChange={event => editor.chain().focus().setColor(event.target.value).run()}/>
    </label>
    {button('1.', '번호 목록', state.ordered, chain => chain.toggleOrderedList())}
    {button('•', '글머리 목록', state.bullet, chain => chain.toggleBulletList())}
    <select aria-label="글자 크기" disabled={!editable} value={state.size} onChange={event => editor.chain().focus().setFontSize(event.target.value).run()}>
      {sizes.map(size => <option key={size} value={size}>{size.replace('px', '')}</option>)}
    </select><span className="explorer-font-unit">px</span>
  </div>;
}
