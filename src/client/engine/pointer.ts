import type { UiState } from '../state';
import type { BubbleState } from '../state';
import { playPop } from '../audio';
import { vibratePop } from '../haptics';
import { isGridCleared, populateGrid, registerPop } from './grid';

export type PopHandler = () => void;

export type PopEffects = {
  onPopAt?: (clientX: number, clientY: number, comboMultiplier: number) => void;
};

export function attachPointerEngine(
  gridRoot: HTMLElement,
  state: UiState,
  onPop: PopHandler,
  effects?: PopEffects
): () => void {
  let isDragging = false;

  const tryPop = (target: EventTarget | null, event?: PointerEvent): void => {
    if (!(target instanceof HTMLElement)) return;
    const bubble = target.closest<HTMLElement>('.bubble.intact');
    if (!bubble || bubble.classList.contains('popped')) return;

    const id = bubble.dataset.id;
    if (!id) return;

    const bubbleState = state.session.bubbles.get(id);
    if (!bubbleState || bubbleState.popped) return;

    bubbleState.popped = true;
    bubbleState.type = 'popped';
    bubble.classList.add('popping');
    window.setTimeout(() => {
      bubble.classList.remove('intact', 'popping');
      bubble.classList.add('popped');
    }, 180);

    const combo = registerPop(state, performance.now());
    playPop(state.settings.audio);
    vibratePop(state.settings.haptics);
    onPop();

    const rect = bubble.getBoundingClientRect();
    const cx = event?.clientX ?? rect.left + rect.width / 2;
    const cy = event?.clientY ?? rect.top + rect.height / 2;
    effects?.onPopAt?.(cx, cy, combo);

    if (isGridCleared(state)) {
      populateGrid(state);
      refillGridDom(gridRoot, state);
    }
  };

  const onPointerDown = (event: PointerEvent): void => {
    isDragging = true;
    tryPop(event.target, event);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!isDragging) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    tryPop(target, event);
  };

  const onPointerUp = (): void => {
    isDragging = false;
  };

  gridRoot.addEventListener('pointerdown', onPointerDown);
  gridRoot.addEventListener('pointermove', onPointerMove);
  gridRoot.addEventListener('pointerup', onPointerUp);
  gridRoot.addEventListener('pointercancel', onPointerUp);

  return () => {
    gridRoot.removeEventListener('pointerdown', onPointerDown);
    gridRoot.removeEventListener('pointermove', onPointerMove);
    gridRoot.removeEventListener('pointerup', onPointerUp);
    gridRoot.removeEventListener('pointercancel', onPointerUp);
  };
}

function createBubbleElement(id: string, bubbleState: BubbleState): HTMLButtonElement {
  const bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.dataset.id = id;
  bubble.className = `bubble ${bubbleState.popped ? 'popped' : 'intact'}`;
  bubble.setAttribute('aria-label', 'Bubble');
  if (!bubbleState.popped) {
    const img = document.createElement('img');
    img.src = '/assets/bubble.svg';
    img.alt = '';
    img.className = 'bubble-img';
    img.draggable = false;
    bubble.append(img);
  }
  return bubble;
}

export function refillGridDom(gridRoot: HTMLElement, state: UiState): void {
  gridRoot.replaceChildren();
  for (const [id, bubbleState] of state.session.bubbles.entries()) {
    gridRoot.append(createBubbleElement(id, bubbleState));
  }
}

export function createGridElement(state: UiState): HTMLElement {
  const { gridCols, gridRows } = state.session;
  const grid = document.createElement('div');
  grid.className = 'bubble-grid';
  grid.style.setProperty('--grid-cols', String(gridCols));
  grid.style.setProperty('--grid-rows', String(gridRows));
  grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;

  for (const [id, bubbleState] of state.session.bubbles.entries()) {
    grid.appendChild(createBubbleElement(id, bubbleState));
  }

  return grid;
}
