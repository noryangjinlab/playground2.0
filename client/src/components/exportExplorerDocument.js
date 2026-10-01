function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function exportExplorerDocument(editorElement, title, format) {
  if (!editorElement) throw new Error('내보낼 문서가 없습니다.');
  const filename = Array.from(title || '제목 없음', character => character.charCodeAt(0) < 32 ? '_' : character).join('').replace(/[<>:"/\\|?*]/g, '_').replace(/[. ]+$/, '').slice(0, 120) || '문서';
  // Snapshot before loading libraries so switching documents cannot change the export.
  const host = document.createElement('div');
  host.className = 'file-explorer explorer-export-host';
  const page = document.createElement('article');
  page.className = 'explorer-export-page';
  const heading = document.createElement('h1');
  heading.textContent = title || '제목 없음';
  const body = document.createElement('div');
  body.className = 'explorer-editor readonly';
  const clone = editorElement.cloneNode(true);
  clone.removeAttribute('contenteditable');
  clone.querySelectorAll('[data-attachment-delete]').forEach(element => element.remove());
  clone.querySelectorAll('[data-lab-image-delete], [data-lab-image-resize], [data-child-note-delete], .explorer-block-handle, .ProseMirror-separator, .ProseMirror-trailingBreak').forEach(element => element.remove());
  // Images themselves are drag targets; removing those elements erases document content.
  clone.querySelectorAll('[data-drag-handle]').forEach(element => element.removeAttribute('data-drag-handle'));
  clone.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
  clone.querySelectorAll('select').forEach(select => {
    const label = document.createElement('span');
    label.textContent = select.selectedOptions[0]?.textContent || '';
    select.replaceWith(label);
  });
  body.append(clone); page.append(heading, body); host.append(page); document.body.append(host);
  try {
    await document.fonts.ready;
    await Promise.all([...clone.querySelectorAll('img')].map(img => img.decode().catch(() => { throw new Error('문서 이미지를 불러오지 못했습니다. 이미지 주소를 확인하세요.'); })));
    const { toCanvas } = await import('html-to-image');
    const width = page.scrollWidth, height = page.scrollHeight;
    if (height > 30000 || width * height > 32000000) throw new Error('문서가 너무 큽니다. 페이지를 나누어 내보내 주세요.');
    const canvas = await toCanvas(page, { backgroundColor: '#ffffff', pixelRatio: 1.5, width, height, preferredFontFormat: 'woff2' });
    if (format === 'png') {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('이미지 파일을 생성하지 못했습니다.');
      download(blob, `${filename}.png`);
    } else {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
      const margin = 12;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
      const sliceHeight = Math.floor(pageHeight * canvas.width / pageWidth);
      for (let y = 0; y < canvas.height; y += sliceHeight) {
        if (y) pdf.addPage();
        const slice = document.createElement('canvas');
        slice.width = canvas.width; slice.height = Math.min(sliceHeight, canvas.height - y);
        slice.getContext('2d').drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, slice.width, slice.height);
        pdf.addImage(slice, 'PNG', margin, margin, pageWidth, slice.height * pageWidth / canvas.width);
      }
      download(pdf.output('blob'), `${filename}.pdf`);
    }
  } finally { host.remove(); }
}
