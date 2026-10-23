import { useEditorState, NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import { TextStyle } from '@tiptap/extension-text-style';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import java from 'highlight.js/lib/languages/java';
import { Extension, Node } from '@tiptap/core';
import { useRef, useMemo } from 'react';
const lowlight = createLowlight(common)

lowlight.register({
  javascript,
  typescript,
  python,
  json,
  bash,
  cpp,
  java,
})


const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => (element.style.fontSize ? element.style.fontSize.replace(/['"]/g, '') : null),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        fontSize =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

const ChildNote = Node.create({
  name: 'childNote',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      noteId: { default: null },
      title: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-child-note]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const title = HTMLAttributes.title || '(제목 없음)'

    return [
      'span',
      {
        'data-child-note': 'true',
        'data-note-id': HTMLAttributes.noteId,
        style: 'display:inline-block;margin:0 2px;',
      },
      [
        'span',
        {
          'data-child-note-box': 'true',
          style:
            `
            display: inline-block;
            position: relative;
            background: transparent;
            cursor: pointer;
            text-decoration: underline;
            color: rgb(197, 172, 9);
            word-break: break-all;
            line-height: 1.8em;
            `,
        },
        ['span', { style: 'pointer-events:none;' }, title],
        [
          'button',
          {
            'data-child-note-delete': 'true',
            type: 'button',
            style:
              `
              opacity: 0.5;
              position: absolute;
              top: -1px;
              right: -3px;
              width: 12px;
              height: 12px;
              border: none;
              border-radius: 50%;
              background:#f66;
              color: black;
              font-size: 10px;
              line-height: 10px;
              text-align: center;
              cursor: pointer;
              padding: 0;
              `,
          },
          '×',
        ],
      ],
    ]
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state } = this.editor
        const { selection } = state
        const { $from } = selection
        const nodeBefore = $from.nodeBefore

        if ((selection.node && selection.node.type.name === this.name) || (nodeBefore && nodeBefore.type.name === this.name)) {
          return true
        }
        return false
      },
      Delete: () => {
        const { state } = this.editor
        const { selection } = state
        const { $from } = selection
        const nodeAfter = $from.nodeAfter

        if ((selection.node && selection.node.type.name === this.name) || (nodeAfter && nodeAfter.type.name === this.name)) {
          return true
        }
        return false
      },
    }
  },
})

const LabImageView = props => {
  const { node, updateAttributes, editor } = props
  const canEdit = useEditorState({ editor, selector: ({ editor: current }) => current.isEditable })
  const startRef = useRef(null)

  const onMouseDownHandle = e => {
    if (!editor.isEditable) return
    e.preventDefault()
    e.stopPropagation()

    const img = e.currentTarget.parentElement.querySelector('img')
    if (!img) return

    const rect = img.getBoundingClientRect()
    startRef.current = {
      startX: e.clientX,
      startW: rect.width,
    }

    const onMove = ev => {
      if (!startRef.current) return
      const dx = ev.clientX - startRef.current.startX
      const nextW = Math.max(80, Math.round(startRef.current.startW + dx))
      updateAttributes({ width: `${nextW}px` })
    }

    const onUp = () => {
      startRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const styleW = node.attrs.width ? { width: node.attrs.width } : {}

  return (
    <NodeViewWrapper data-lab-image="true" data-filename={node.attrs.filename || ''} style={{ display: 'block', margin: '6px 0', maxWidth: '100%' }}>
      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', width: 'fit-content' }}>
        <img
          data-drag-handle
          src={node.attrs.src || ''}
          alt={node.attrs.alt || ''}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            cursor: canEdit ? 'grab' : 'default',
            ...styleW,
          }}
          draggable={false}
        />

        <button
          data-lab-image-delete="true"
          type="button"
          style={{
            opacity: 0.6,
            position: 'absolute',
            top: 4,
            right: 4,
            width: 14,
            height: 14,
            border: 'none',
            borderRadius: '50%',
            background: '#f66',
            color: '#000',
            fontSize: 12,
            lineHeight: '12px',
            textAlign: 'center',
            cursor: canEdit ? 'pointer' : 'default',
            padding: 0,
            display: canEdit ? 'block' : 'none',
          }}
        >
          ×
        </button>

        <div
          data-lab-image-resize="true"
          onMouseDown={onMouseDownHandle}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 14,
            height: 14,
            cursor: canEdit ? 'nwse-resize' : 'default',
            background: 'transparent',
            display: canEdit ? 'block' : 'none',
          }}
        />
      </div>
    </NodeViewWrapper>
  )
}

const LabImage = Node.create({
  name: 'labImage',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      filename: { default: null },
      alt: { default: '' },
      width: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-lab-image]',
        getAttrs: dom => {
          const img = dom.querySelector('img')
          const style = img ? img.getAttribute('style') || '' : ''
          const wMatch = style.match(/width\s*:\s*([^;]+)\s*;/i)
          return {
            src: img ? img.getAttribute('src') : null,
            alt: img ? img.getAttribute('alt') : '',
            filename: dom.getAttribute('data-filename') || null,
            width: wMatch ? wMatch[1].trim() : null,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src || ''
    const alt = HTMLAttributes.alt || ''
    const filename = HTMLAttributes.filename || ''
    const w = HTMLAttributes.width ? `width:${HTMLAttributes.width};` : ''

    return [
      'div',
      {
        'data-lab-image': 'true',
        'data-filename': filename,
        style: 'display:block;margin:6px 0;max-width:100%;',
      },
      [
        'div',
        {
          style: 'position:relative;display:inline-block;max-width:100%;width:fit-content;',
        },
        [
          'img',
          {
            src,
            alt,
            style: `display:block;max-width:100%;height:auto;${w}`,
            draggable: 'false',
            'data-drag-handle': 'true',
          },
        ],
        [
          'button',
          {
            'data-lab-image-delete': 'true',
            type: 'button',
            style:
              `
              opacity: 0.5;
              position: absolute;
              top: -1px;
              right: -3px;
              width: 12px;
              height: 12px;
              border: none;
              border-radius: 50%;
              background:#f66;
              color: black;
              font-size: 10px;
              line-height: 10px;
              text-align: center;
              cursor: pointer;
              padding: 0;
              `,
          },
          '×',
        ],
        [
          'div',
          {
            'data-lab-image-resize': 'true',
            style: 'position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize;background:transparent;',
          },
        ],
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(LabImageView)
  },
})

const CodeBlockView = props => {
  const { node, updateAttributes, editor, extension, deleteNode } = props
  const canEdit = !!editor && editor.isEditable
  const current = node.attrs.language || 'plaintext'

  const languages = useMemo(() => {
    const ll = extension?.options?.lowlight || lowlight
    const list = ll?.listLanguages?.() || []
    return [...new Set(['plaintext', ...list])]
  }, [extension])

  const handleDelete = e => {
    e.preventDefault()
    e.stopPropagation()

    if (!canEdit) return

    const ok = window.confirm('정말 삭제할겨?')
    if (!ok) return

    deleteNode()
  }

  return (
    <NodeViewWrapper
      data-codeblock="true"
      style={{
        position: 'relative',
        margin: '12px 0',
      }}
    >
      {canEdit ? (
        <div
          contentEditable={false}
          style={{
            marginBottom: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            data-drag-handle
            title="드래그해서 이동"
            style={{
              height: 26,
              minWidth: 34,
              padding: '0 8px',
              borderRadius: 6,
              border: '1px solid #333',
              background: '#181818',
              color: '#aaa',
              fontFamily: 'galmuri9',
              fontSize: 13,
              lineHeight: '24px',
              cursor: 'grab',
              userSelect: 'none',
              textAlign: 'center',
            }}
          >
            ⋮⋮
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <select
              value={current}
              onChange={e => {
                const v = e.target.value
                updateAttributes({ language: v === 'plaintext' ? null : v })
              }}
              style={{
                height: 26,
                fontFamily: 'galmuri9',
                padding: '0 6px',
                cursor: 'pointer',
              }}
            >
              {languages.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleDelete}
              style={{
                width: 26,
                height: 26,
                border: 'none',
                borderRadius: 6,
                background: '#f66',
                color: '#000',
                fontSize: 16,
                lineHeight: '24px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <pre spellCheck={false}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

const CodeBlock = CodeBlockLowlight.extend({
  draggable: true,

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView)
  },
}).configure({ lowlight, enableTabIndentation: true, tabSize: 4 })

export { CodeBlock, TextStyle, FontSize, ChildNote, LabImage };
