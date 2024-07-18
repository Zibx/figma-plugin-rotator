import {PluginMessage, SelectionMessage} from '../types';
import {LOCALE} from '../constants/locale';
import {getContext} from './context';
import {MESSAGE_TYPE} from '../constants/consts';

export function initMessageProcessor(): void {
  const {hideMessage, showMessage, resetInputValues} = getContext();

  const messageProcess = {
    [MESSAGE_TYPE.SELECTION]: function (msg: SelectionMessage) {
      if (msg.amount === 1 && msg.supported) {
        resetInputValues(msg.transformation);
        hideMessage();
        return;
      }

      if (msg.amount !== 1) {
        showMessage(LOCALE.NOTHING_SELECTED());
      } else if (!msg.supported) {
        showMessage(LOCALE.NOT_SUPPORTED(msg));
      }
    },
    [MESSAGE_TYPE.OTHER]: function ({type}: SelectionMessage) {
      console.warn('Unknown message from plugin to UI', type);
    }
  };

  onmessage = (event: MessageEvent<PluginMessage>) => {
    const msg = event?.data?.pluginMessage;
    const type: MESSAGE_TYPE = event?.data?.pluginMessage?.type;
    if (!type) {
      throw new Error('Something wrong with message ' + JSON.stringify(event?.data));
    }

    if (type in messageProcess) {
      messageProcess[type](msg);
    } else {
      messageProcess[MESSAGE_TYPE.OTHER](msg);
    }
  };
}
