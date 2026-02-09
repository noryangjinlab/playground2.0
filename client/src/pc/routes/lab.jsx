import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Extension, Node } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import styled from 'styled-components'
import { fetchApi } from '../../api'

const TipTapEditor = styled.div`
  .ProseMirror {
    padding: 1px 5px 1px 5px;
  }

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
              'opacity:0.6;position:absolute;top:4px;right:4px;width:14px;height:14px;border:none;border-radius:50%;background:#f66;color:#111;font-size:12px;line-height:12px;text-align:center;cursor:pointer;padding:0;',
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

const LabImageBehavior = Extension.create({
  name: 'labImageBehavior',

  addProseMirrorPlugins() {
    const editor = this.editor

    const uploadImage = async file => {
      const fd = new FormData()
      fd.append('file', file)
      const data = await fetchApi('/lab/image/upload', {
        method: 'POST',
        body: fd,
      })
      return data
    }

    const insertFiles = async (files, insertPos) => {
      let pos = typeof insertPos === 'number' ? insertPos : editor.state.selection.from

      for (const f of files) {
        const data = await uploadImage(f)
        const url = data?.url
        const filename = data?.filename
        if (!url) continue

        editor
          .chain()
          .focus()
          .insertContentAt(pos, {
            type: 'labImage',
            attrs: { src: url, filename: filename || null, alt: f.name || '', width: null },
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
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID()
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const Lab = () => {
  const { id: routeId } = useParams()
  const navigate = useNavigate()

  const [fontSizeValue, setFontSizeValue] = useState('')
  const DEFAULT_FONT_SIZE = '16px'

  const [admin, setAdmin] = useState(null)
  const isAdmin = admin === 'admin0106'

  const [noteId, setNoteId] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteAncestors, setNoteAncestors] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const saveTimerRef = useRef(null)
  const activeNoteRef = useRef(null)
  const loadReqRef = useRef(0)

  useEffect(() => {
    const next = routeId || HOME_ID
    setNoteId(next)
  }, [routeId])

  useEffect(() => {
    activeNoteRef.current = noteId
    setIsLoaded(false)
    setLoadError(null)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
  }, [noteId])

  useEffect(() => {
    const run = () => {
      fetchApi('/auth/me', { method: 'GET' })
        .then(data => {
          setAdmin(data?.username || null)
        })
        .catch(error => {
          setAdmin(null)
          console.log(error.message)
        })
    }
    run()
  }, [])

  const scheduleSave = useCallback(
    json => {
      const nid = activeNoteRef.current
      if (!nid) return
      if (!isAdmin) return
      if (!isLoaded) return

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null
        const targetId = activeNoteRef.current
        if (!targetId) return

        fetchApi('/lab/save', {
          method: 'POST',
          body: JSON.stringify({
            id: targetId,
            content: json,
          }),
        }).catch(error => {
          console.log(error.message)
        })
      }, 300)
    },
    [isAdmin, isLoaded],
  )

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, FontSize, ChildNote, LabImage, LabImageBehavior],
    content: '',
    editable: false,
    onUpdate({ editor }) {
      scheduleSave(editor.getJSON())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(isAdmin)
  }, [editor, isAdmin])

  useEffect(() => {
    if (!editor || !noteId) return

    const reqId = ++loadReqRef.current
    setIsLoaded(false)
    setLoadError(null)

    fetchApi(`/lab/${noteId}`, { method: 'GET' })
      .then(data => {
        if (loadReqRef.current !== reqId) return
        if (activeNoteRef.current !== noteId) return

        const content = data?.content ?? ''
        editor.commands.setContent(content, false)
        setNoteTitle(data?.title || '')
        setNoteAncestors(data?.ancestors || [])
        setIsLoaded(true)
        setLoadError(null)
      })
      .catch(error => {
        if (loadReqRef.current !== reqId) return
        if (activeNoteRef.current !== noteId) return

        setLoadError(error?.message || 'load failed')
        setIsLoaded(false)
      })
  }, [editor, noteId])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [])

  const canEdit = !!editor && isAdmin

  const runIfEditable = fn => {
    if (!editor) return
    if (!isAdmin) return
    if (!isLoaded) return
    fn()
  }

  const openNote = targetId => {
    if (!targetId) return
    navigate(`/lab/${targetId}`)
  }

  const handleEditorClick = e => {
    if (!editor) return
    if (!isLoaded) return

    const imgDeleteBtn = e.target.closest('[data-lab-image-delete]')
    if (imgDeleteBtn) {
      if (!isAdmin) return

      const ok = window.confirm('정말 삭제할겨?')
      if (!ok) return

      const container = imgDeleteBtn.closest('[data-lab-image]')
      if (!container) return
      const filename = container.getAttribute('data-filename')
      if (!filename) return

      fetchApi(`/lab/image/delete/${encodeURIComponent(filename)}`, { method: 'DELETE' }).catch(error => {
        console.log(error.message)
      })

      const pos = editor.view.posAtDOM(container, 0)
      editor.chain().setNodeSelection(pos).deleteSelection().run()
      return
    }

    const deleteBtn = e.target.closest('[data-child-note-delete]')
    if (deleteBtn) {
      if (!isAdmin) return

      const ok = window.confirm('정말 삭제할겨?')
      if (!ok) return

      const container = deleteBtn.closest('[data-child-note]')
      if (!container) return
      const targetId = container.getAttribute('data-note-id')
      if (!targetId) return

      fetchApi(`/lab/delete/${targetId}`, { method: 'DELETE' }).catch(error => {
        console.log(error.message)
      })

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

  const handleCreateChildNote = () => {
    if (!editor || !noteId) return
    if (!isAdmin) return
    if (!isLoaded) return

    const title = window.prompt('새 노트 제목을 입력하세요') || '(제목 없음)'
    const childId = makeUuid()

    const childDoc = { type: 'doc', content: [] }

    fetchApi('/lab/save', {
      method: 'POST',
      body: JSON.stringify({
        id: childId,
        parentId: noteId,
        title,
        content: childDoc,
      }),
    }).catch(error => {
      console.log(error.message)
    })

    editor
      .chain()
      .focus()
      .insertContent([{ type: 'childNote', attrs: { noteId: childId, title } }, { type: 'paragraph' }])
      .run()
  }

  const handleBreadcrumbClick = item => {
    if (!item || !item.id) return
    openNote(item.id)
  }

  const breadcrumbs = useMemo(() => {
    if (!noteId) return []
    if (noteId === HOME_ID) return [{ label: 'home', id: HOME_ID }]

    const list = [{ label: 'home', id: HOME_ID }]

    ;(noteAncestors || [])
      .filter(a => a.id && a.id !== HOME_ID)
      .forEach(a => {
        list.push({ label: a.title || '(제목 없음)', id: a.id })
      })

    list.push({ label: noteTitle || '(제목 없음)', id: noteId })
    return list
  }, [noteId, noteTitle, noteAncestors])

  useEffect(() => {
    if (!editor) return

    const syncFontSize = () => {
      const v = editor.getAttributes('textStyle')?.fontSize
      setFontSizeValue(v || DEFAULT_FONT_SIZE)
    }

    syncFontSize()
    editor.on('selectionUpdate', syncFontSize)
    editor.on('transaction', syncFontSize)

    return () => {
      editor.off('selectionUpdate', syncFontSize)
      editor.off('transaction', syncFontSize)
    }
  }, [editor])

  return (
    <div style={{ padding: '10px 13px 0 0' }}>
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
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleBreadcrumbClick(item)}>
                  {item.label || '(제목 없음)'}
                </span>
              )}
            </span>
          )
        })}
      </div>

      {loadError ? (
        <div
          style={{
            fontFamily: 'galmuri9',
            fontSize: 14,
            color: '#e0e0e0',
            background: '#111',
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <div style={{ marginBottom: 10 }}>로드 실패: {String(loadError)}</div>
          <button
            type="button"
            style={{ height: 30, fontFamily: 'galmuri9', padding: 5, cursor: 'pointer' }}
            onClick={() => {
              if (!editor || !noteId) return
              const reqId = ++loadReqRef.current
              setIsLoaded(false)
              setLoadError(null)
              fetchApi(`/lab/${noteId}`, { method: 'GET' })
                .then(data => {
                  if (loadReqRef.current !== reqId) return
                  if (activeNoteRef.current !== noteId) return
                  editor.commands.setContent(data?.content ?? '', false)
                  setNoteTitle(data?.title || '')
                  setNoteAncestors(data?.ancestors || [])
                  setIsLoaded(true)
                  setLoadError(null)
                })
                .catch(error => {
                  if (loadReqRef.current !== reqId) return
                  if (activeNoteRef.current !== noteId) return
                  setLoadError(error?.message || 'load failed')
                  setIsLoaded(false)
                })
            }}
          >
            다시 불러오기
          </button>
        </div>
      ) : null}

      <div
        style={{
          display: canEdit && isLoaded && !loadError ? 'flex' : 'none',
          gap: 8,
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <button
          style={{ height: '30px', fontFamily: 'galmuri9', padding: '5px', cursor: 'pointer' }}
          type="button"
          disabled={!canEdit || !isLoaded}
          onClick={() => runIfEditable(() => editor.chain().focus().toggleBold().run())}
        >
          Bold
        </button>

        <button
          style={{ height: '30px', fontFamily: 'galmuri9', padding: '5px', cursor: 'pointer' }}
          type="button"
          disabled={!canEdit || !isLoaded}
          onClick={() => runIfEditable(() => editor.chain().focus().toggleItalic().run())}
        >
          Italic
        </button>

        <button
          style={{ height: '30px', fontFamily: 'galmuri9', padding: '5px', cursor: 'pointer' }}
          type="button"
          disabled={!canEdit || !isLoaded}
          onClick={() => runIfEditable(() => editor.chain().focus().toggleBulletList().run())}
        >
          Bullet
        </button>

        <select
          style={{ height: '30px', fontFamily: 'galmuri9', padding: '5px', cursor: 'pointer' }}
          disabled={!canEdit || !isLoaded}
          value={fontSizeValue}
          onChange={e => {
            const v = e.target.value
            runIfEditable(() => editor.commands.setFontSize(v))
            setFontSizeValue(v)
          }}
        >
          <option value="9px">9px</option>
          <option value="11px">11px</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>

        <button
          style={{ height: '30px', fontFamily: 'galmuri9', padding: '5px', cursor: 'pointer' }}
          type="button"
          disabled={!canEdit || !isLoaded}
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