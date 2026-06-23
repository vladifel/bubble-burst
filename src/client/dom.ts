type DomAttrs = Record<string, string | number | boolean | undefined>;
type DomChild = Node | string;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: DomAttrs = {},
  children: DomChild[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined) continue;
    if (key === 'className') {
      node.className = String(value);
    } else if (key === 'text') {
      node.textContent = String(value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      node.addEventListener(eventName, value as EventListener);
    } else {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of children) {
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return node;
}

export function elWithClick<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: DomAttrs,
  onClick: EventListener,
  children: DomChild[] = []
): HTMLElementTagNameMap[K] {
  const node = el(tag, attrs, children);
  node.addEventListener('click', onClick);
  return node;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}

export function icon(name: string, filled = false): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = `material-symbols-outlined${filled ? ' icon-filled' : ''}`;
  span.textContent = name;
  return span;
}

export function statBar(label: string, value: string, percent: number, variant: 'cyan' | 'magenta'): HTMLElement {
  const fill = el('div', {
    className: `progress-bar-fill progress-bar-fill-${variant}`,
    style: `width: ${Math.min(100, Math.max(0, percent))}%`,
  });
  return el('div', { className: 'stat-row' }, [
    el('div', { className: 'stat-row-header' }, [
      el('span', { className: 'label-caps', text: label }),
      el('span', { className: `stat-value stat-value-${variant}`, text: value }),
    ]),
    el('div', { className: 'progress-bar-track' }, [fill]),
  ]);
}
