import { requestExpandedMode } from '@devvit/web/client';

const startButton = document.getElementById('start-button');
startButton?.addEventListener('click', (event) => {
  requestExpandedMode(event, 'game');
});
