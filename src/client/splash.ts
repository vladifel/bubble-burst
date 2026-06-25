import { requestExpandedMode } from '@devvit/web/client';

const startButton = document.getElementById('start-button');

function openGame(event: Event): void {
  try {
    requestExpandedMode(event, 'game');
  } catch {
    window.location.assign('game.html');
  }
}

startButton?.addEventListener('click', openGame);
