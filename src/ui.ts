import './ui.css';
import {initDOM} from './view/dom';
import {listenEvents} from './view/events';

initDOM().then(() => {
  listenEvents();
});
