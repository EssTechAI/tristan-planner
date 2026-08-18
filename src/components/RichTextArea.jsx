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

function getCursorOffsetInLine(lineDiv) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  if (!lineDiv.contains(range.startContainer)) return null;
  const preRange = document.createRange();
  preRange.selectNodeContents(lineDiv);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
}

const BULLET_CHARS = ['•', '◦', '▪'];
const INDENT_UNIT = '  '; // 2 spaces per nesting level

function parseBullet(lineText) {
  const m = lineText.match(/^( *)([•◦▪]) /);
  if (!m) return null;
  const indent = m[1];
  return { indent, marker: m[2], level: Math.round(indent.length / INDENT_UNIT.length), prefixLength: m[0].length };
}

export default function RichTextArea({ value, onChange, placeholder, minHeight = 60 }) {
  const ref = useRef(null);
  const focused = useRef(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!value || value.trim() === '');

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = valueToHtml(value);
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

      const bullet = parseBullet(lineText);
      const numberedMatch = !bullet ? lineText.match(/^(\d+)\.\s/) : null;
      const prefix = bullet ? lineText.slice(0, bullet.prefixLength) : (numberedMatch ? numberedMatch[0] : '');

      // Pressing Enter on an empty list line exits the list instead of continuing it
      if (prefix && lineText.slice(prefix.length).trim() === '') {
        lineDiv.innerHTML = '<br>';
        setCursorAt(lineDiv, 0);
        emit();
        return;
      }

      // Split the line at the cursor: text before stays, text after moves to
      // a new line below (inheriting the bullet/number, at the same nesting
      // level, if this was a list line)
      const rawOffset = getCursorOffsetInLine(lineDiv);
      const offset = Math.max(rawOffset ?? lineText.length, prefix.length);
      const beforeText = lineText.slice(0, offset);
      const afterText = lineText.slice(offset);
      const nextPrefix = bullet ? `${bullet.indent}${bullet.marker} ` : (numberedMatch ? `${parseInt(numberedMatch[1], 10) + 1}. ` : '');
      const newLineText = nextPrefix + afterText;

      if (beforeText) {
        lineDiv.textContent = beforeText;
      } else {
        lineDiv.innerHTML = '<br>';
      }

      const nd = document.createElement('div');
      if (newLineText) {
        nd.textContent = newLineText;
      } else {
        nd.innerHTML = '<br>';
      }
      lineDiv.after(nd);

      if (newLineText) {
        setCursorAt(nd.firstChild, nextPrefix.length);
      } else {
        setCursorAt(nd, 0);
      }

      emit();
      return;
    }

    if (e.key === 'Tab') {
      const bullet = parseBullet(lineText);
      if (!bullet) return; // only bullet lines support nesting; let Tab behave normally elsewhere
      e.preventDefault();

      const newLevel = bullet.level + (e.shiftKey ? -1 : 1);
      if (newLevel < 0) return; // already at the top level

      const content = lineText.slice(bullet.prefixLength);
      const newIndent = INDENT_UNIT.repeat(newLevel);
      const newMarker = BULLET_CHARS[Math.min(newLevel, BULLET_CHARS.length - 1)];
      lineDiv.textContent = `${newIndent}${newMarker} ${content}`;
      setCursorAt(lineDiv.firstChild, lineDiv.textContent.length);
      emit();
      return;
    }

    if (e.key === 'Backspace') {
      const bullet = parseBullet(lineText);
      if (bullet && lineText.slice(bullet.prefixLength).trim() === '') {
        e.preventDefault();
        if (bullet.level > 0) {
          // Empty nested bullet: outdent one level instead of clearing it entirely
          const newLevel = bullet.level - 1;
          const newIndent = INDENT_UNIT.repeat(newLevel);
          const newMarker = BULLET_CHARS[Math.min(newLevel, BULLET_CHARS.length - 1)];
          lineDiv.textContent = `${newIndent}${newMarker} `;
          setCursorAt(lineDiv.firstChild, lineDiv.textContent.length);
        } else {
          lineDiv.innerHTML = '<br>';
          setCursorAt(lineDiv, 0);
        }
        emit();
        return;
      }
      if (/^\d+\.\s$/.test(lineText)) {
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
        className="w-full outline-none text-[12px] leading-[1.5]"
        style={{ color: '#3d3f4e', wordBreak: 'break-word', minHeight }}
      />
    </div>
  );
}
