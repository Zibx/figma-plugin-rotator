import './ui.css';
import {initDOM} from './controller/context';
import {listenEvents} from './view/events';
import {initMessageProcessor} from './controller/message';

initDOM().then(() => {
  listenEvents();
  initMessageProcessor();
});
