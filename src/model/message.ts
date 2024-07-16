import {BasicMessage, PluginMessage, SelectionMessage} from '../types';
import {LOCALE} from '../constants/locale';
import {getDomCtx} from '../view/dom';
export function initMessageProcessor(): void {
  const {hideMessage, showMessage} = getDomCtx();

  const messageProcess = {
    selection: function (msg: SelectionMessage) {
      if (msg.amount === 1 && msg.supported) {
        hideMessage();
        return;
      }

      if (msg.amount !== 1) {
        showMessage(LOCALE.NOTHING_SELECTED());
      } else if (!msg.supported) {
        showMessage(LOCALE.NOT_SUPPORTED(msg));
      }
    },
    other: function (value: BasicMessage) {
      console.warn('Unknown message from plugin to UI', value);
    }
  };

  onmessage = (event: MessageEvent<PluginMessage>) => {
    const type = event?.data?.pluginMessage?.type;
    if (!type) {
      throw new Error('Something wrong with message ' + JSON.stringify(event?.data));
    }
    if (type in messageProcess) {
      messageProcess[type](event.data.pluginMessage);
    } else {
      messageProcess['other'](event.data.pluginMessage);
    }
  };
}
