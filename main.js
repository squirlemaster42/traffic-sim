// A point consists of x, y
const points = [];
const rectSize = 10;

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

    points.push({
        x: x,
        y: y,
    });

    drawCurves(canvas, ctx)
}

function drawCurves(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//TODO You need to reweite this code to handle your point array instead of what it expects

//Inspiration: https://github.com/gdenisov/cardinal-spline-js/blob/master/src/curve.js
function computeSplinePoints() {
    'use strict';

    const tension = 0.5;
    const segments = 25;
    const close = false;

    let pts;
    let i = 1;
    let l = points.length;
    let rPos = 0;
    let rLen = (l - 2) * (close ? 2 * segments : 0);
    let res = new Float32Array(rLen);
    let cache = new Float32Array((segments + 2) * 4);
    let cachePts = 4;

    pts = points.slice(0);

    if (close) {
        pts.unshift(points[l - 1]);
        pts.unshift(points[l - 2]);
        pts.push(points[0], points[1]);
    } else {
        pts.unshift(points[1]);
        pts.unshift(points[0]);
        pts.push(points[l - 2], points[l - 1]);
    }

    cache[0] = 1;

    for (; i < segments; i++) {
        let st = 1 / segments;
        let st2 = st * st;
        let st3 = st2 * st;
        let st23 = st3 * 2;
        let st32 = st2 * 3;

        cache[cachePts++] = st23 - st32 + 1;
        cache[cachePts++] = st32 - st23;
        cache[cachePts++] = st3 - 2 * st2 + st;
        cache[cachePts++] = st3 - st2;
    }

    cache[++cachePts] = 1;

    parse(pts, cache, l);

    if (close) {
        pts = [];
        pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]);
        pts.push(points[0], points[1], points[2], points[3]);
        parse(pts, cache, 4);
    }

    function parse(pts, cache, l) {
        let t;
        for (let i = 2; i < l; i += 2) {
            let pt1 = pts[i];
            let pt2 = pts[i + 1];
            let pt3 = pts[i + 2];
            let pt4 = pts[i + 3];

            let t1x = (pt3 - pts[i - 2]) * tension;
            let t1y = (pt4 - pts[i - 1]) * tension;
            let t2x = (pts[i + 4] - pt2) * tension;
            let t2y = (pts[i + 5] - pt2) * tension;

            for (t = 0; t < segments; t++) {
                let c = t << 2; // times 4
                let c1 = cache[c];
                let c2 = cache[c + 1];
                let c3 = cache[c + 2];
                let c4 = cache[c + 3];

                res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
                res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
            }
        }
    }

    l = close ? 0 : points.length - 2;
    res[rPos++] = points[l];
    res[rPos] = points[l + 1];

    return res;
}

window.addEventListener('load', draw);
