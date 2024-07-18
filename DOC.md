# Directory Structure

All source code is in the 📁`src` directory

After running `build` script — `dist` directory with all production files would be generated.

Now let's go down into the 📁`src`

## Generic

### 📁`src/constants`
- `locale.ts` — UI text strings
- `consts.ts` — enums and `Initial Transform`

### 📁`src`
- `types.ts` — types

### 📁`src/util`
- `debounce.ts` — wrap functions for prevent too much calls (figma update speed is a bottleneck in the instant mode)
- `Point.ts` — simple Point class implementation
- `vectorPathsTransform.ts` — take SVG path and produce transformed one
- `math.ts` — rotation matrix, 3D projection, 2D projection, radToDeg, degToRad 


## Backend

### 📁`src`
`plugin.ts` is an entry point for the plugin. It renders the `ui.html` file, and call functions from the 📁`backend`. Actually it just listens for figma's `selectionchange` and create\modify the copy of an element

### 📁`src/backend`
- `copyNode.ts` —  copies a given node. It extracts paths differently for different types of nodes
- `getCachedNode.ts` — weakMap that return copied node with metadata. If cache does not exist — it clones the node and return
- `onSelectionChange.ts` — listens for figma selection change and inform the `UI` about it
- `uiMessage.ts` — receive messages from UI. Get element from cache and update it
- `updateVector.ts` — calls path modification and update the copy position

## Frontend

### 📁`src`
- `ui.ts` — is an entry point for the UI (frontend). It waits for the DOM init, subscribes to the UI messages and initialize communication with the backend
- `ui.html` — simple HTML code for the whole plugin. I can spawn elements from js, but tried to keep it simple
- `ui.css` — styles

### 📁`src/view`
- `elements.ts` — collect all necessary elements from DOM
- `events.ts` — listen to DOM events on collected elements, on window. When value changes — delivers that value to the main context controller via calling the delegate `updateInputValue(key, val)`
- `preview.ts` — drawing preview on canvas, handling canvas events (gizmos are not in dom, they are just drawn)
- `previewCircleGizmo.ts` — method for drawing gizmo with applied 3D Transformation. Also, it stores gizmo colliders coordinates. I used a simple approach — each gizmo is made from line segments, and there are ~20 points in each segment. By storing this points with corresponding X\Y\Z axis we can later just find the nearest point to the cursor with some limits like `distance < 7`

### 📁`src/controller`
- `context.ts` — glue between all parts. Have methods like show\hide message, `updateInputValue`, send message to backend when needed
- `message.ts` — listen for messages from the backend. When selection is changed — it resets all inputs to initial (or received) state

