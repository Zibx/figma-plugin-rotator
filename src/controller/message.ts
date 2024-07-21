import {BasicMessage, PluginMessage, SelectionMessage} from '../types';
import {LOCALE} from '../constants/locale';
import {getContext} from './context';
import {MESSAGE_TYPE} from '../constants/consts';

export function initMessageProcessor(): void {
  const {
    hideMessage,
    showMessage,
    resetInputValues,
    showUpdatePathButton,
    hideUpdatePathButton,
    showCloneDialog,
    hideCloneDialog,
    showObjectModificationDialog,
    hideObjectModificationDialog
  } = getContext();

  const messageProcess = {
    [MESSAGE_TYPE.ORIGINAL_PATH_UPDATED]: function () {
      showUpdatePathButton();
    },
    [MESSAGE_TYPE.SELECTION]: function (msg: SelectionMessage) {
      hideUpdatePathButton();

      hideMessage();
      hideObjectModificationDialog();
      hideCloneDialog();
      if (msg.amount === 1 && msg.supported) {
        if (!msg.transformation) {
          showCloneDialog();
        } else {
          showObjectModificationDialog();
        }
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

    console.log('Message to UI', msg);

    if (type in messageProcess) {
      const callback: (msg: BasicMessage) => void = messageProcess[type as never];
      callback(msg);
    } else {
      messageProcess[MESSAGE_TYPE.OTHER](msg);
    }
  };
}
