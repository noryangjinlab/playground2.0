import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Extension, Node } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import styled from 'styled-components'


const TipTapEditor = styled.div`
  .ProseMirror {
    padding: 1px 5px 1px 5px;
  }

  // 해당 속성을 가진 태그 선택 : []
  &.readonly [data-child-note-delete] {
    display: none;
  }

  &.readonly [data-lab-image-delete] {
    display: none;
  }

  &.readonly [data-lab-image-resize] {
    display: none;
  }
`

const HOME_ID = '6f9b4f4e-9f2a-4eb0-9b0b-2f0fadc12345'


// 글자 사이즈 변경 커스텀 익스텐션 정의
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element =>
              element.style.fontSize ? element.style.fontSize.replace(/['"]/g, '') : null,
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
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      noteId: { default: null },
      title: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'p[data-child-note]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const title = HTMLAttributes.title || '(제목 없음)'

    return [
      'p',
      {
        'data-child-note': 'true',
        'data-note-id': HTMLAttributes.noteId,
        style: 'margin:8px 0;',
      },
      [
        'span',
        {
          'data-child-note-box': 'true',
          style:
            'display:inline-block;position:relative;padding:0 5px 0 0;background:#111;cursor:pointer;text-decoration: underline;color: rgba(197, 172, 9, 1);',
        },
        ['span', { style: 'pointer-events:none;' }, title],
        [
          'button',
          {
            'data-child-note-delete': 'true',
            type: 'button',
            style:
              'opacity:0.5;position:absolute;top:-3px;right:-3px;width:12px;height:12px;border:none;border-radius:50%;background:#f66;color:#111;font-size:10px;line-height:10px;text-align:center;cursor:pointer;padding:0;',
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

        if (
          (selection.node && selection.node.type.name === this.name) ||
          (nodeBefore && nodeBefore.type.name === this.name)
        ) {
          return true
        }
        return false
      },
      Delete: () => {
        const { state } = this.editor
        const { selection } = state
        const { $from } = selection
        const nodeAfter = $from.nodeAfter

        if (
          (selection.node && selection.node.type.name === this.name) ||
          (nodeAfter && nodeAfter.type.name === this.name)
        ) {
          return true
        }
        return false
      },
    }
  },
})

const LabImageView = props => {
  const { node, updateAttributes, editor } = props
  const canEdit = !!editor && editor.isEditable
  const startRef = useRef(null)

  const onMouseDownHandle = e => {
    if (!canEdit) return
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
    <NodeViewWrapper
      data-lab-image="true"
      data-filename={node.attrs.filename || ''}
      style={{ display: 'block', margin: '6px 0', maxWidth: '100%' }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          maxWidth: '100%',
          width: 'fit-content',
        }}
      >
        <img
          src={node.attrs.src || ''}
          alt={node.attrs.alt || ''}
          style={{ display: 'block', maxWidth: '100%', height: 'auto', ...styleW }}
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
            color: '#111',
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
          style:
            'position:relative;display:inline-block;max-width:100%;width:fit-content;',
        },
        [
          'img',
          {
            src,
            alt,
            style: `display:block;max-width:100%;height:auto;${w}`,
            draggable: 'false',
          },
        ],
        [
          'button',
          {
            'data-lab-image-delete': 'true',
            type: 'button',
            style:
              'opacity:0.6;position:absolute;top:4px;right:4px;width:14px;height:14px;border:none;border-radius:50%;background:#f66;color:#111;font-size:12px;line-height:12px;text-align:center;cursor:pointer;padding:0;',
          },
          '×',
        ],
        [
          'div',
          {
            'data-lab-image-resize': 'true',
            style:
              'position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize;background:transparent;',
          },
        ],
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(LabImageView)
  },
})

const LabImageBehavior = Extension.create({
  name: 'labImageBehavior',

  addProseMirrorPlugins() {
    const editor = this.editor

    const uploadImage = async file => {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('https://noryangjinlab.org/lab/image/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (!res.ok) throw new Error('image upload failed')
      return await res.json()
    }

    const insertFiles = async (files, insertPos) => {
      let pos = typeof insertPos === 'number' ? insertPos : editor.state.selection.from

      for (const f of files) {
        const data = await uploadImage(f)
        const url = data.url
        const filename = data.filename

        editor
          .chain()
          .focus()
          .insertContentAt(pos, {
            type: 'labImage',
            attrs: { src: url, filename, alt: f.name || '', width: null },
          })
          .run()

        pos = editor.state.selection.to
      }
    }

    const selectionHasLabImage = (state, key) => {
      const { selection, doc } = state

      if (selection.node && selection.node.type && selection.node.type.name === 'labImage') return true

      let found = false
      doc.nodesBetween(selection.from, selection.to, node => {
        if (node.type && node.type.name === 'labImage') {
          found = true
          return false
        }
        return !found
      })
      if (found) return true

      if (selection.empty) {
        const $from = selection.$from
        if (key === 'Backspace' && $from.nodeBefore && $from.nodeBefore.type.name === 'labImage') return true
        if (key === 'Delete' && $from.nodeAfter && $from.nodeAfter.type.name === 'labImage') return true
      }

      return false
    }

    return [
      new Plugin({
        props: {
          handleKeyDown: (view, event) => {
            if (event.key !== 'Backspace' && event.key !== 'Delete') return false
            if (!selectionHasLabImage(view.state, event.key)) return false
            event.preventDefault()
            return true
          },

          handlePaste: (view, event) => {
            if (!editor.isEditable) return false
            const dt = event.clipboardData
            if (!dt) return false

            const files = Array.from(dt.files || []).filter(f => f && f.type && f.type.startsWith('image/'))
            if (files.length === 0) return false

            event.preventDefault()

            ;(async () => {
              try {
                await insertFiles(files)
              } catch (e) {
                console.error(e)
              }
            })()

            return true
          },

          handleDrop: (view, event) => {
            if (!editor.isEditable) return false
            const dt = event.dataTransfer
            if (!dt) return false

            const files = Array.from(dt.files || []).filter(f => f && f.type && f.type.startsWith('image/'))
            if (files.length === 0) return false

            event.preventDefault()

            const coords = { left: event.clientX, top: event.clientY }
            const dropPos = view.posAtCoords(coords)
            const pos = dropPos ? dropPos.pos : editor.state.selection.from

            ;(async () => {
              try {
                await insertFiles(files, pos)
              } catch (e) {
                console.error(e)
              }
            })()

            return true
          },
        },
      }),
    ]
  },
})

function makeUuid() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const Lab = () => {
  const { id: routeId } = useParams()
  const navigate = useNavigate()

  const [admin, setAdmin] = useState(null)
  const [noteId, setNoteId] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteAncestors, setNoteAncestors] = useState([])
  const saveTimerRef = useRef(null)

  useEffect(() => {
    if (routeId) setNoteId(routeId)
    else setNoteId(HOME_ID)
  }, [routeId])

  const scheduleSave = useCallback(
    json => {
      if (!noteId) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

      saveTimerRef.current = setTimeout(async () => {
        saveTimerRef.current = null
        await fetch('https://noryangjinlab.org/lab/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: noteId,
            content: json,
          }),
        })
      }, 1000)
    },
    [noteId],
  )

  useEffect(() => {
    const run = async () => {
      const res = await fetch('https://noryangjinlab.org/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok) setAdmin(data.username)
      else setAdmin(null)
    }
    run()
  }, [])

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, FontSize, ChildNote, LabImage, LabImageBehavior],
    content: '',
    editable: false,
    onUpdate({ editor }) {
      const json = editor.getJSON()
      scheduleSave(json)
    },
  })

  useEffect(() => {
    if (!editor || !noteId) return

    const run = async () => {
      try {
        const res = await fetch(`https://noryangjinlab.org/lab/${noteId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (res.ok) {
          const note = await res.json()
          if (note && note.content) editor.commands.setContent(note.content)
          else editor.commands.setContent('<p>Hello Tiptap</p>')

          setNoteTitle(note.title || '')
          setNoteAncestors(note.ancestors || [])
        } else {
          editor.commands.setContent('')
          setNoteTitle('')
          setNoteAncestors([])
        }
      } catch (e) {
        console.error(e)
      }
    }
    run()
  }, [editor, noteId])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(admin === 'admin0106')
  }, [editor, admin])

  const canEdit = !!editor && admin === 'admin0106'

  const runIfEditable = fn => {
    if (!editor) return
    if (admin !== 'admin0106') return
    fn()
  }

  const openNote = targetId => {
    if (!targetId) return
    navigate(`/lab/${targetId}`)
  }

  const handleEditorClick = async e => {
    if (!editor) return

    const imgDeleteBtn = e.target.closest('[data-lab-image-delete]')
    if (imgDeleteBtn) {
      if (admin !== 'admin0106') return

      const ok = window.confirm("정말 삭제할겨?")
      if (!ok) return

      const container = imgDeleteBtn.closest('[data-lab-image]')
      if (!container) return
      const filename = container.getAttribute('data-filename')
      if (!filename) return

      try {
        const res = await fetch(
          `https://noryangjinlab.org/lab/image/delete/${encodeURIComponent(filename)}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          },
        )
        if (!res.ok) return
      } catch (err) {
        console.error(err)
        return
      }

      const pos = editor.view.posAtDOM(container, 0)
      editor.chain().setNodeSelection(pos).deleteSelection().run()
      return
    }

    const deleteBtn = e.target.closest('[data-child-note-delete]')
    if (deleteBtn) {

      if (admin !== 'admin0106') return

      const ok = window.confirm("정말 삭제할겨?")
      if (!ok) return
      
      const container = deleteBtn.closest('[data-child-note]')
      if (!container) return
      const targetId = container.getAttribute('data-note-id')
      if (!targetId) return

      try {
        const res = await fetch(`https://noryangjinlab.org/lab/delete/${targetId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) return
      } catch (err) {
        console.error(err)
        return
      }

      const pos = editor.view.posAtDOM(container, 0)
      editor.chain().setNodeSelection(pos).deleteSelection().run()
      return
    }

    const el = e.target.closest('[data-child-note]')
    if (!el) return
    const targetId = el.getAttribute('data-note-id')
    if (!targetId) return
    openNote(targetId)
  }

  const handleCreateChildNote = async () => {
    if (!editor || !noteId) return
    if (admin !== 'admin0106') return

    const title = window.prompt('새 노트 제목을 입력하세요') || '(제목 없음)'
    const childId = makeUuid()

    const childDoc = {
      type: 'doc',
      content: [],
    }

    await fetch('https://noryangjinlab.org/lab/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: childId,
        parentId: noteId,
        title,
        content: childDoc,
      }),
    })

    editor
      .chain()
      .focus()
      .insertContent({
        type: 'childNote',
        attrs: {
          noteId: childId,
          title,
        },
      })
      .run()
  }

  const handleBreadcrumbClick = item => {
    if (!item || !item.id) return
    openNote(item.id)
  }

  const breadcrumbs = (() => {
    if (!noteId) return []
    if (noteId === HOME_ID) return [{ label: 'home', id: HOME_ID }]

    const list = []
    list.push({ label: 'home', id: HOME_ID })

    ;(noteAncestors || [])
      .filter(a => a.id && a.id !== HOME_ID)
      .forEach(a => {
        list.push({ label: a.title || '(제목 없음)', id: a.id })
      })

    list.push({ label: noteTitle || '(제목 없음)', id: noteId })
    return list
  })()

  return (
    <div
      style={{
        padding: '10px 13px 0 0',
      }}
    >
      <div
        style={{
          marginBottom: '40px',
          fontFamily: 'galmuri9',
          fontSize: '15px',
          color: '#b1b1b1ff',
        }}
      >
        {breadcrumbs.map((item, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <span key={idx}>
              {idx > 0 && ' > '}
              {isLast ? (
                <span>{item.label || '(제목 없음)'}</span>
              ) : (
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => handleBreadcrumbClick(item)}
                >
                  {item.label || '(제목 없음)'}
                </span>
              )}
            </span>
          )
        })}
      </div>

      <div
        style={{
          display: canEdit ? 'flex' : 'none',
          gap: 8,
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <button
          style={{
            height: '30px',
            fontFamily: 'galmuri9',
            padding: '5px',
            cursor: 'pointer',
          }}
          type="button"
          disabled={!canEdit}
          onClick={() => runIfEditable(() => editor.chain().focus().toggleBold().run())}
        >
          Bold
        </button>

        <button
          style={{
            height: '30px',
            fontFamily: 'galmuri9',
            padding: '5px',
            cursor: 'pointer',
          }}
          type="button"
          disabled={!canEdit}
          onClick={() => runIfEditable(() => editor.chain().focus().toggleItalic().run())}
        >
          Italic
        </button>

        <button
          style={{
            height: '30px',
            fontFamily: 'galmuri9',
            padding: '5px',
            cursor: 'pointer',
          }}
          type="button"
          disabled={!canEdit}
          onClick={() => runIfEditable(() => editor.chain().focus().toggleBulletList().run())}
        >
          Bullet
        </button>

        <select
          style={{
            height: '30px',
            fontFamily: 'galmuri9',
            padding: '5px',
            cursor: 'pointer',
          }}
          disabled={!canEdit}
          defaultValue=""
          onChange={e => {
            const v = e.target.value
            runIfEditable(() => {
              if (v === '') editor.commands.unsetFontSize()
              else editor.commands.setFontSize(v)
            })
          }}
        >
          <option value="">Font size</option>
          <option value="9px">9</option>
          <option value="11px">11</option>
          <option value="14px">14</option>
          <option value="18px">18</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>

        <button
          style={{
            height: '30px',
            fontFamily: 'galmuri9',
            padding: '5px',
            cursor: 'pointer',
          }}
          type="button"
          disabled={!canEdit}
          onClick={handleCreateChildNote}
        >
          노트 추가하기
        </button>
      </div>

      <TipTapEditor onClick={handleEditorClick} className={canEdit ? 'editable' : 'readonly'}>
        <EditorContent editor={editor} />
      </TipTapEditor>
    </div>
  )
}

export default Lab