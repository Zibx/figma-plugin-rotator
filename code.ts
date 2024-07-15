// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many rectangles on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__, { themeColors: true});
  figma.ui.resize(300, 300)

  let vector: VectorNode;

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage =  (msg: {type: string, count: number, from: number, to: number, formula: string}) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.


    if (msg.type === 'create-shapes') {

      if(!vector || vector.removed)
        vector = figma.createVector();


      const fn = new Function('x', 'const sin = Math.sin, cos = Math.cos, abs = Math.abs; let y;'+msg.formula+';return -y');


      const data = ['M '+msg.from.toFixed(2)+' '+fn(msg.from).toFixed(2)];
      if(msg.to <= msg.from)
        return;

      const delta = msg.to-msg.from,
            step = delta/(msg.count-1);

      let i;
      for (i = 1; i < msg.count-1; i++) {
        data.push('C '+
          (msg.from+(i-0.5)*step).toFixed(2)+' '+fn(msg.from+(i-0.5)*step).toFixed(2)+' '+
          (msg.from+(i-0.5)*step).toFixed(2)+' '+fn(msg.from+(i-0.5)*step).toFixed(2)+' '+
          (msg.from+i*step).toFixed(2)+' '+fn(msg.from+i*step).toFixed(2))
      }
      data.push('L '+(msg.from+i*step).toFixed(2)+' '+fn(msg.from+i*step).toFixed(2))
      vector.strokes = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];

      console.log(data.join(' '))

      vector.vectorPaths = [
        {
          windingRule: 'EVENODD',
          data: data.join(' ')
        }
      ];
      figma.currentPage.appendChild(vector);



      figma.currentPage.selection = [vector];
      figma.viewport.scrollAndZoomIntoView([vector]);
    }
  };
}
