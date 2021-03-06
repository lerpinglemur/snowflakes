import { Component } from "gibbon.js";
import CanvasDraw from "gibbon.js/utils/canvasDraw";
import * as PIXI from 'pixi.js';
import { Gradient } from "gibbon.js/data/gradient";
import { lerpColor } from "gibbon.js/utils/colorUtils";
import { EVT_SNOW, WIN_SNOW } from "./stats";


const TEX_WIDTH = 1;
/**
 * @const {number} TEX_HEIGHT - sky texture size.
 */
const TEX_HEIGHT = 512;

/**
 * @const {object.<number,number[]>} skyColors - colors at different
 * snow counts.
 */
var SkyColors = [

	{ at:0, colors:[0x1308d2,0x4040da, 0xff6200 ], stops:[0.2,0.75,1] },
	{ at:0.1*WIN_SNOW, colors:[0x17109a,0x2020a6,0xba0e0e ], stops:[0.2,0.75,1]  },
	{ at:0.25*WIN_SNOW, colors:[0x000044,0x110088,0x771181 ], stops:[0.2,0.75,1] },
	{ at:0.40*WIN_SNOW, colors:[0x040141,0x110088,0x771181 ], stops:[0.2,0.75,1] },
	{ at:0.55*WIN_SNOW, colors:[0x020024,0x131378,0x4c00ff ], stops:[0.2,0.75,1] },
	{ at:0.75*WIN_SNOW, colors:[0x010121,0x0d0f44,0x1a0d7e ], stops:[0.2,0.75,1] },
	{ at:WIN_SNOW, colors:[0x010121,0x070b32,0x03073e ], stops:[0.2,0.75,1] }


]

export default class Sky extends Component {

	get time() { return this._time; }
	set time(v) { this._time = v;}

	setSky(ind) {

		let info = SkyColors[ind];
		// slice in case future reset.
		this.skyGradient.colors = info.colors.slice(0);
		this.skyGradient.stops = info.stops;

		this.index = ind;
		if ( ind === SkyColors.length-1 ) {
			this.game.emitter.removeListener( EVT_SNOW, this.onCount, this );
		}

		this.redrawSky();

	}

	init(){

		this.view = this.game.screen;
		this.draw = new CanvasDraw( TEX_WIDTH, TEX_HEIGHT );

		let s = PIXI.Sprite.from( this.draw.canvas);
		s.width = this.view.width;
		s.height = this.view.height;
		this.sky = s;

		this.skyGradient = new Gradient();
		this.setSky(0);

		// count when sky last updated.
		this.lastCount = 0;

		this.clip.addChild(s);

		this.game.on(EVT_SNOW, this.onCount, this );

		//this.clip.texture = this.texture;

	}

	reset() {
		this.lastCount = 0;
		this.setSky(0);
	}

	redrawSky(){
		this.draw.gradFill( new PIXI.Point(0,0), new PIXI.Point( 0, TEX_HEIGHT ), this.skyGradient );
		this.sky.texture.update();
	}

	onCount( count ) {

		if ( count - this.lastCount < 3 ) return;
		this.lastCount = count;

		var nxt = SkyColors[this.index+1];
		if ( count >= nxt.at ) {
			this.setSky( this.index+1);
			return;
		}

		var prev = SkyColors[this.index];

		var curColors = this.skyGradient.colors;
		var prevColors = prev.colors;
		var nextColors = nxt.colors;

		let pct = ( count - prev.at ) / (nxt.at - prev.at);
		if ( pct < 0 || pct >1 ) console.log('INVALID PCT: ' + pct + ' prev.at: ' + prev.at + '  nxt.at: ' + nxt.at + ' count: '+ count );

		for( let i = curColors.length-1; i>=0; i-- ) {
			curColors[i] = lerpColor( prevColors[i], nextColors[i], pct );
			//console.log( htmlStr( curColors[i]) );
		}

		this.redrawSky();

	}

}