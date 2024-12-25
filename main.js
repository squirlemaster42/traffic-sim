// A curve consists of x0, y0, x1, y1 and two control pointx cx0, cy0, cx1, cy1
const curves = [];

//When the user user is selecting points
//they will cycle through the following states
// p0 (selecting the first point)
// p1 (selecting the second point)
// c0 (selecting the first control point)
// c1 (selecting the second control point)
let state = "p0"

const rectSize = 10;

// TODO:
// - Point selecting state machine
// - Draw draw curves
// - Allow users to edit curves

function draw() {
    const canvas = document.getElementById('canv');
    const ctx = canvas.getContext('2d');
    const offsetX = canvas.offsetLeft + canvas.clientLeft;
    const offsetY = canvas.offsetTop + canvas.clientTop;

    canvas.addEventListener('click', (event) => {
        addPoint(event, canvas, ctx, offsetX, offsetY);
    });
}

function addPoint(event, canvas, ctx, offsetX, offsetY) {
    const x = event.pageX - offsetX - (rectSize / 2);
    const y = event.pageY - offsetY - (rectSize / 2);

    let actingCurve = {};

    //We want to skip p0 if the length of
    //curves is > 0 and set the first point of the new curve
    //to p1 of the previous

    if (curves.length > 0 && state !== "p0") {
        actingCurve = curves[curves.length - 1];
    } else if (curves.length > 0 && state === "p0") {
        prevCurve = curves[curves.length - 1];
        actingCurve.x0 = prevCurve.x1;
        actingCurve.y0 = prevCurve.y1;
        curves.push(actingCurve);
        state = "p1";
    } else {
        curves.push(actingCurve);
    }

    switch (state) {
        case "p0":
            actingCurve.x0 = x;
            actingCurve.y0 = y;
            state = "p1";
            break;
        case "p1":
            actingCurve.x1 = x;
            actingCurve.y1 = y;
            state = "c0";
            break;
        case "c0":
            actingCurve.cx0 = x;
            actingCurve.cy0 = y;
            state = "c1";
            break;
        case "c1":
            actingCurve.cx1 = x;
            actingCurve.cy1 = y;
            state = "p0";
            break;
        default:
            console.log("Invalid state detected: " + state);
    }

    console.log(state);
    console.log(curves);

    drawCurves(canvas, ctx)
}

function drawCurves(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    for (p in curves) {
        ctx.fillStyle = "black";
        ctx.fillRect(curves[p].x0, curves[p].y0, rectSize, rectSize);
        ctx.fillRect(curves[p].x1, curves[p].y1, rectSize, rectSize);
        ctx.fillStyle = "blue";
        ctx.fillRect(curves[p].cx0, curves[p].cy0, rectSize, rectSize);
        ctx.fillRect(curves[p].cx1, curves[p].cy1, rectSize, rectSize);

        if (curves[p].cx0) {
            ctx.moveTo(curves[p].x0 + (rectSize / 2), curves[p].y0 + (rectSize / 2));
            ctx.bezierCurveTo(curves[p].cx0,
                curves[p].cy0,
                curves[p].cx1,
                curves[p].cy1,
                curves[p].x1 + (rectSize / 2),
                curves[p].y1 + (rectSize / 2));
        }
    }
    ctx.stroke();
}

window.addEventListener('load', draw);
