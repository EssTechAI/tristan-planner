import { useRef, useEffect, useState } from 'react';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function valueToHtml(text) {
  if (!text) return '<div><br></div>';
  return text
    .split('\n')
    .map(line => `<div>${line ? escapeHtml(line) : '<br>'}</div>`)
    .join('');
}

function htmlToText(el) {
  const lines = [];
  el.childNodes.forEach(node => {
    if (node.nodeName === 'DIV' || node.nodeName === 'P') {
      lines.push(node.textContent || '');
    } else if (node.nodeName === 'BR') {
      lines.push('');
    } else if (node.nodeType === 3) {
      lines.push(node.textContent || '');
    }
  });
  return lines.join('\n');
}

function getCurrentLineDiv(editor) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  let node = sel.getRangeAt(0).startContainer;
  if (node.nodeType === 3) node = node.parentNode;
  while (node && node.parentNode !== editor) node = node.parentNode;
  return node && node !== editor ? node : null;
}

function setCursorAt(node, offset) {
  try {
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch { /* ignore */ }
}

export default function RichTextArea({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const focused = useRef(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!value);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = valueToHtml(value);
    setShowPlaceholder(!value || value.trim() === '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ref.current && !focused.current) {
      ref.current.innerHTML = valueToHtml(value);
      setShowPlaceholder(!value || value.trim() === '');
    }
  }, [value]);

  const emit = () => {
    if (!ref.current) return;
    const text = htmlToText(ref.current);
    setShowPlaceholder((!text || text.trim() === '') && !focused.current);
    onChange(text);
  };

  const handleKeyDown = (e) => {
    const editor = ref.current;
    if (!editor) return;
    const lineDiv = getCurrentLineDiv(editor);
    if (!lineDiv || lineDiv.nodeName !== 'DIV') return;

    const lineText = lineDiv.textContent || '';

    if (e.key === ' ') {
      if (lineText === '-' || lineText === '*') {
        e.preventDefault();
        lineDiv.textContent = '• ';
        const tn = lineDiv.firstChild;
        if (tn) setCursorAt(tn, 2);
        emit();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      if (lineText.startsWith('• ')) {
        const content = lineText.slice(2).trim();
        if (!content) {
          lineDiv.innerHTML = '<br>';
          setCursorAt(lineDiv, 0);
        } else {
          const nd = document.createElement('div');
          nd.textContent = '• ';
          lineDiv.after(nd);
          const tn = nd.firstChild;
          if (tn) setCursorAt(tn, 2);
        }
      } else if (/^\d+\.\s/.test(lineText)) {
        const match = lineText.match(/^(\d+)\.\s/);
        const content = lineText.slice(match[0].length).trim();
        if (!content) {
          lineDiv.innerHTML = '<br>';
          setCursorAt(lineDiv, 0);
        } else {
          const num = parseInt(match[1], 10);
          const nd = document.createElement('div');
          nd.textContent = `${num + 1}. `;
          lineDiv.after(nd);
          const tn = nd.firstChild;
          if (tn) setCursorAt(tn, tn.textContent.length);
        }
      } else {
        const nd = document.createElement('div');
        nd.innerHTML = '<br>';
        lineDiv.after(nd);
        setCursorAt(nd, 0);
      }

      emit();
      return;
    }

    if (e.key === 'Backspace') {
      if (lineText === '• ' || /^\d+\.\s$/.test(lineText)) {
        e.preventDefault();
        lineDiv.innerHTML = '<br>';
        setCursorAt(lineDiv, 0);
        emit();
      }
    }
  };

  return (
    <div className="relative">
      {showPlaceholder && (
        <div
          className="absolute top-0 left-0 text-[12px] leading-[1.5] pointer-events-none select-none"
          style={{ color: '#d0d3e0' }}
        >
          {placeholder}
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={emit}
        onFocus={() => { focused.current = true; setShowPlaceholder(false); }}
        onBlur={() => {
          focused.current = false;
          const text = htmlToText(ref.current);
          setShowPlaceholder(!text || text.trim() === '');
        }}
        className="w-full min-h-[60px] outline-none text-[12px] leading-[1.5]"
        style={{ color: '#3d3f4e', wordBreak: 'break-word' }}
      />
    </div>
  );
}
