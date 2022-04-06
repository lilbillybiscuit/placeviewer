const ctx = placecanvas.getContext("2d");
requestAnimationFrame(update);
const mouse  = {x : 0, y : 0, button : false, wheel : 0, lastX : 0, lastY : 0, drag : false};
const gridLimit = 64;  // max grid lines for static grid
const gridSize = 128;  // grid size in screen pixels for adaptive and world pixels for static
const scaleRate = 1.02; // Closer to 1 slower rate of change
                        // Less than 1 inverts scaling change and same rule
                        // Closer to 1 slower rate of change
const topLeft = {x: 0, y: 0};  // holds top left of canvas in world coords.


function mouseEvents(e){
    const bounds = placecanvas.getBoundingClientRect();
    mouse.x = e.pageX - bounds.left - scrollX;
    mouse.y = e.pageY - bounds.top - scrollY;
    mouse.button = e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouse.button;
    if(e.type === "wheel"){
        mouse.wheel += -e.deltaY;
        e.preventDefault();
    }
}
["mousedown", "mouseup", "mousemove"].forEach(name => document.addEventListener(name,mouseEvents));
document.addEventListener("wheel",mouseEvents, {passive: false});

const panZoom = {
    x : 0,
    y : 0,
    scale : 1,
    apply() { ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y) },
    scaleAt(x, y, sc) {  // x & y are screen coords, not world
        this.scale *= sc;
        this.x = x - (x - this.x) * sc;
        this.y = y - (y - this.y) * sc;
    },
    toWorld(x, y, point = {}) {   // converts from screen coords to world coords
        const inv = 1 / this.scale;
        point.x = (x - this.x) * inv;
        point.y = (y - this.y) * inv;
        return point;
    },
}
function drawGrid(gridScreenSize = 128, adaptive = true){
    var scale, gridScale, size, x, y, limitedGrid = false;
    if (adaptive) {
        scale = 1 / panZoom.scale;
        gridScale = 2 ** (Math.log2(gridScreenSize * scale) | 0);
        size = Math.max(w, h) * scale + gridScale * 2;
        x = ((-panZoom.x * scale - gridScale) / gridScale | 0) * gridScale;
        y = ((-panZoom.y * scale - gridScale) / gridScale | 0) * gridScale;
    } else {
        gridScale = gridScreenSize;
        size = Math.max(w, h) / panZoom.scale + gridScale * 2;
        panZoom.toWorld(0,0, topLeft);
        x = Math.floor(topLeft.x / gridScale) * gridScale;
        y = Math.floor(topLeft.y / gridScale) * gridScale;
        if (size / gridScale > gridLimit) {
            size = gridScale * gridLimit;
            limitedGrid = true;
        }            
    } 
    panZoom.apply();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    for (i = 0; i < size; i += gridScale) {
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + size);
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + size, y + i);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
    ctx.stroke();
    
    //info.textContent = "Scale: 1px = " + (1/panZoom.scale).toFixed(4) + " world px ";
    //limitedGrid && (info.textContent += " Static grid limit " + (gridLimit * gridLimit) + " cells");    
}   
function drawPoint(x, y) {
    const worldCoord = panZoom.toWorld(x, y);
    panZoom.apply();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();   
    ctx.moveTo(worldCoord.x - 10, worldCoord.y);
    ctx.lineTo(worldCoord.x + 10, worldCoord.y);
    ctx.moveTo(worldCoord.x, worldCoord.y - 10);
    ctx.lineTo(worldCoord.x, worldCoord.y + 10); 
    ctx.setTransform(1, 0, 0, 1, 0, 0); //reset the transform so the lineWidth is 1
    ctx.stroke();
    
    info.textContent = "Scale: 1px = " + (1/panZoom.scale).toFixed(4) + " world px ";
    limitedGrid && (info.textContent += " Static grid limit " + (gridLimit * gridLimit) + " cells");    
}   
function drawPoint(x, y) {
    const worldCoord = panZoom.toWorld(x, y);
    panZoom.apply();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();   
    ctx.moveTo(worldCoord.x - 10, worldCoord.y);
    ctx.lineTo(worldCoord.x + 10, worldCoord.y);
    ctx.moveTo(worldCoord.x, worldCoord.y - 10);
    ctx.lineTo(worldCoord.x, worldCoord.y + 10); 
    ctx.setTransform(1, 0, 0, 1, 0, 0); //reset the transform so the lineWidth is 1
    ctx.stroke();  
}

var w = placecanvas.width;
var h = placecanvas.height;
function update(){
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.globalAlpha = 1;           // reset alpha
    if (w !== innerWidth || h !== innerHeight) {
        w = placecanvas.width = innerWidth;
        h = placecanvas.height = innerHeight;
    } else {
        ctx.clearRect(0, 0, w, h);
    }
    if (mouse.wheel !== 0) {
        let scale = 1;
        scale = mouse.wheel < 0 ? 1 / scaleRate : scaleRate;
        mouse.wheel *= 0.8;
        if(Math.abs(mouse.wheel) < 1){
            mouse.wheel = 0;
        }
        panZoom.scaleAt(mouse.x, mouse.y, scale); //scale is the change in scale
    }
    if (mouse.button) {
       if (!mouse.drag) {
          mouse.lastX = mouse.x;
          mouse.lastY = mouse.y;
          mouse.drag = true;
       } else {
          panZoom.x += mouse.x - mouse.lastX;
          panZoom.y += mouse.y - mouse.lastY;
          mouse.lastX = mouse.x;
          mouse.lastY = mouse.y;
       }
    } else if (mouse.drag) {
        mouse.drag = false;
    }
    drawGrid(gridSize, false);
    drawPoint(mouse.x, mouse.y);
    requestAnimationFrame(update);
}