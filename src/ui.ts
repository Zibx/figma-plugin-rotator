import './ui.css';
import {initDOM} from './view/dom';
import {listenEvents} from './view/events';
import {initMessageProcessor} from './model/message';

initDOM().then(() => {
  listenEvents();
  initMessageProcessor();
});
