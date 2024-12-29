// A point consists of x, y
const ctrlPoints = [];
const rectSize = 10;

//A car is {
//  color
//  distance
//  speed
//}
const cars = [];

function draw() {
    const canvas = document.getElementById('canv');
    const ctx = canvas.getContext('2d');
    const offsetX = canvas.offsetLeft + canvas.clientLeft;
    const offsetY = canvas.offsetTop + canvas.clientTop;

    canvas.addEventListener('click', (event) => {
        addPoint(event, canvas, ctx, offsetX, offsetY);
    });

    drawCurves(canvas, ctx);
}

function addPoint(event, canvas, ctx, offsetX, offsetY) {
    const x = event.pageX - offsetX - (rectSize / 2);
    const y = event.pageY - offsetY - (rectSize / 2);

    ctrlPoints.push({
        x: x,
        y: y,
    });

    drawCurves(canvas, ctx)
}

function drawCurves(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let p = [];
    let j = 0;
    for (let i = 0; i < ctrlPoints.length; i++) {
        p[j] = ctrlPoints[i].x;
        p[j + 1] = ctrlPoints[i].y;
        j += 2
    }

    const close = document.querySelector("#done").checked;

    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.curve(p, 0.5, 25, close);
    ctx.stroke();
}

window.addEventListener('load', draw);

const CarSim = {};

;(() => {
    function main(tFrame) {
        CarSim.stopMain = window.requestAnimationFrame(main);
        const nextTick = CarSim.lastTick + CarSim.tickLength;
        let numTicks = 0;

        if (tFrame > nextTick) {
            const timeSinceTick = tFrame - CarSim.lastTick;
            numTicks = Math.floor(timeSinceTick / CarSim.tickLength);
        }

        queueUpdates(numTicks);
        render(tFrame);
        CarSim.lastRender = tFrame;
    }

    function queueUpdates(numTicks) {
        for (let i = 0; i < numTicks; i++) {
            CarSim.lastTick += CarSim.tickLength;
            update(CarSim.lastTick);
        }
    }

    CarSim.lastTick = performance.now();
    CarSim.lastRender = CarSim.lastTick;
    CarSim.tickLength = 50;

    setInitalState();
    main(performance.now());
})();

function setInitalState() {
}

function render(tFrame) {
}

function update(lastTick) {
}


// ---------- LIBRARY FUNCTIONS ------------
// https://github.com/pkorac/cardinal-spline-js/tree/master
CanvasRenderingContext2D.prototype.curve = function(points, tension, numOfSeg, close) {
	'use strict';

	// options or defaults
	tension = (typeof tension === 'number') ? tension : 0.5;
	numOfSeg = numOfSeg ? numOfSeg : 20;

	var pts,					// clone point array
		res = [],
		l = points.length, i,
		cache = new Float32Array((numOfSeg+2)*4),
		cachePtr = 4;

	pts = points.slice(0);

	if (close) {
		pts.unshift(points[l - 1]); // insert end point as first point
		pts.unshift(points[l - 2]);
		pts.push(points[0], points[1]); // first point as last point
	} else {
		pts.unshift(points[1]);	// copy 1. point and insert at beginning
		pts.unshift(points[0]);
		pts.push(points[l - 2], points[l - 1]);	// duplicate end-points
	}

	// cache inner-loop calculations as they are based on t alone
	cache[0] = 1;

	for (i = 1; i < numOfSeg; i++) {

		var st = i / numOfSeg,
			st2 = st * st,
			st3 = st2 * st,
			st23 = st3 * 2,
			st32 = st2 * 3;

		cache[cachePtr++] =	st23 - st32 + 1;	// c1
		cache[cachePtr++] =	st32 - st23;		// c2
		cache[cachePtr++] =	st3 - 2 * st2 + st;	// c3
		cache[cachePtr++] =	st3 - st2;			// c4
	}

	cache[++cachePtr] = 1;

	// calc. points
	parse(pts, cache, l);

	if (close) {
		//l = points.length;
		pts = [];
		pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]); // second last and last
		pts.push(points[0], points[1], points[2], points[3]); // first and second
		parse(pts, cache, 4);
	}

	function parse(pts, cache, l) {
		for (var i = 2; i < l; i += 2) {

			var pt1 = pts[i],
				pt2 = pts[i+1],
				pt3 = pts[i+2],
				pt4 = pts[i+3],

				t1x = (pt3 - pts[i-2]) * tension,
				t1y = (pt4 - pts[i-1]) * tension,
				t2x = (pts[i+4] - pt1) * tension,
				t2y = (pts[i+5] - pt2) * tension;

			for (var t = 0; t <= numOfSeg; t++) {

				var c = t * 4;

				res.push(cache[c] * pt1 + cache[c+1] * pt3 + cache[c+2] * t1x + cache[c+3] * t2x,
						 cache[c] * pt2 + cache[c+1] * pt4 + cache[c+2] * t1y + cache[c+3] * t2y);
			}
		}
	}

	// add lines to path
    for(i = 0, l = res.length; i < l; i += 2) {
		this.lineTo(res[i], res[i+1]);
    }

	return res;
};
