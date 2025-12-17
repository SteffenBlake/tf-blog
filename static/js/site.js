let charWidth = 0;
let h1TotalChars = 0;
// Remove the prefix '#' on the hash
let skipTyping = window.location.hash.slice(1);

function calculateCharWidth() {
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.fontFamily = 'Fira Mono, monospace';
  span.style.fontSize = '16px';
  span.textContent = '─';
  document.body.appendChild(span);
  charWidth = span.getBoundingClientRect().width || 1;
  document.body.removeChild(span);

  const containerWidth = document.getElementById('terminal-root').offsetWidth || 1;
  h1TotalChars = Math.floor(containerWidth / charWidth) - 3;
}

async function typeText(element, text) {
  if (skipTyping) {
    element.nodeValue = text;
    return;
  }
  element.nodeValue = '';
  element.parentNode.classList.add('caret');
  for (let i = 0; i < text.length; i++) {
    element.nodeValue += text[i];
    if (i % 5 == 0) {
      await new Promise(r => setTimeout(r, 1));
    }
  }
  element.parentNode.classList.remove('caret');
}

function generateSuffix(element, prefixText, suffixChar='─', endChar='┐') {
  const totalTextLength = prefixText.length + element.textContent.length;
  const remainingChars = Math.max(0, h1TotalChars - totalTextLength - 1);
  return suffixChar.repeat(remainingChars) + endChar;
}

async function typeHeader(clone, sourceNode, prefix, suffix, ghostId = null) {
  // prefix
  const prefixSpan = document.createElement('span');
  prefixSpan.classList.add('header-wrapper', 'shown');
  const prefixNode = document.createTextNode('');
  prefixSpan.appendChild(prefixNode);
  clone.appendChild(prefixSpan);
  await typeText(prefixNode, prefix);

  // optional anchor link
  if (ghostId) {
    const link = document.createElement('a');
    link.href = `#${ghostId}`;
    link.classList.add('header-link', 'shown');
    link.textContent = '🔗';
    clone.appendChild(link);
  }

  // header content (recursive, preserves <a>, <span>, etc)
  clone.classList.add('shown');
  await typeClone(sourceNode, clone);

  // suffix
  const suffixSpan = document.createElement('span');
  suffixSpan.classList.add('header-wrapper', 'shown');
  const suffixNode = document.createTextNode('');
  suffixSpan.appendChild(suffixNode);
  clone.appendChild(suffixSpan);
  await typeText(suffixNode, suffix);
}

async function typeClone(sourceNode, targetNode) {
  if (sourceNode.nodeType === 3) {
    await typeText(targetNode, sourceNode.nodeValue);
    return;
  }

  for (let i = 0; i < sourceNode.childNodes.length; i++) {
    const child = sourceNode.childNodes[i];
    let clone = (child.nodeType === 3) ? document.createTextNode('') : child.cloneNode(false);
    if(clone.classList) clone.classList.add('shown');
    targetNode.appendChild(clone);

    const id = child.id || null;
    if (id == skipTyping) {
        skipTyping = null;
    }
    switch (child.tagName) {
      case 'H1': {
        const suffix = ' )' + generateSuffix(child, '┌─( ');
        await typeHeader(clone, child, '┌─( ', suffix, id);
        break;
      }
      case 'H2':
        await typeHeader(clone, child, '└─( ', ' )──>', id);
        break;
      case 'H3':
        await typeHeader(clone, child, '<< ', ' >>', id);
        break;
      case 'H4':
        await typeHeader(clone, child, '{ ', ' }', id);
        break;
      default:
        await typeClone(child, clone);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  calculateCharWidth();

  const sourceRoot = document.getElementById('terminal-root');
  const visualRoot = document.createElement(sourceRoot.tagName);
  visualRoot.setAttribute('aria-hidden','true');
  document.getElementById('visual-container').appendChild(visualRoot);

  typeClone(sourceRoot, visualRoot);
});
