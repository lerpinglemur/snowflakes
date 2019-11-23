import { Graphics, DEG_TO_RAD, Polygon, Point } from "pixi.js";
import Gibbon, { Factory, Geom, GameObject } from "../../../gibbon";

const { randInt, randRange} = Gibbon.Rand;
const { move, setReflect, reflection, lerpPt: interPt } = Gibbon.Geom;

import * as PIXI from 'pixi.js';
import { setLerp } from "gibbon.js/utils/geom";
import Flake from "../components/flake";
import Comet from '../components/comet';


/**
 * @const {number[]} CometColors - array of colors for comet particles.
 */
export const CometColors = [ 0xe8e5c1, 0xdeda68, 0xe6e4be, 0xf0e518 ];

/**
 * @const {number[]} FrostColors - array of colors for comet particles.
 */
export const FrostColors = [ 0x4287f5, 0x8bb2f0, 0xa2c4fa, 0xc1c3e8];

/**
 * @const {number} COMET_COLOR - Color of shooting stars.
 */
const COMET_COLOR = 0xe8c21a;

/**
 * @const {number} COMET_SIZE - base comet radius.
 */
const COMET_SIZE = 16;

const FLAKE_COLOR = 0xffffff;

const DRAW_RADIUS = 64;

/**
 * @property {const} SPARK_SIZE - radius for spark particles.
 */
const SPARK_SIZE = 2;

/**
 * @property {number} FLAKE_SIZE - base flake size.
 */
export const FLAKE_RADIUS = 28;

/**
 * @const {number} BASE_SCALE - base scale of snowflake sprite
 * before any depth scaling is applied.
 */
export const BASE_SCALE = FLAKE_RADIUS/DRAW_RADIUS;

/**
 * @const {number} MIN_SEGS - each segment is actually
 * half a snowflake arm.
 */
const MIN_SEGS = 12;
const MAX_SEGS = 12;

/**
 * Get the length of an arc of angle theta
 * at distance r.
 * @param {number} theta
 * @param {number} r
 */
export const arcLen = ( theta, r ) => {
	return r*theta;
}

export default class SnowFactory extends Factory {

	constructor( game ){

		super(game);

		this.maskArc = this.fillArc( 0, 2*Math.PI/MAX_SEGS, DRAW_RADIUS );

		// store spark bitmaps.
		this.makeSparkTex();

	}

	makeSpark() {

		let s = new PIXI.Sprite( this.sparkTex );
		s.tint = CometColors[ randInt(0, CometColors.length ) ];

		return s;

	}

	/**
	 * @param {Point} pt
	 * @returns {GameObject}
	 */
	makeComet(pt) {

		let g = new Graphics();
		g.beginFill( COMET_COLOR );
		g.drawStar( 0, 0, 5, COMET_SIZE, COMET_SIZE/2 );
		g.endFill();

		g.cacheAsBitmap=true;

		let obj = new GameObject( g, pt );
		obj.setDestroyOpts(true,true,true);

		obj.add(Comet);

		return g;

	}

	/**
	 * @param {Point} pt
	 * @returns {GameObject}
	 */
	makeSnowflake( pt ){

		let s = this.createFlake(pt);
		let g = new GameObject(s);
		g.setDestroyOpts(true,true,true);

		g.add( Flake);

		return g;

	}

	createFlake( loc ){

		let r = DRAW_RADIUS;
		const tex = this.makeFlakeTex( r, randInt( MIN_SEGS, MAX_SEGS ) );

		const sprite = new PIXI.Sprite();
		sprite.interactive = false;

		if (!loc) loc = new Point();
		sprite.position.set( loc.x, loc.y );

		sprite.texture = tex;
		sprite.pivot = new Point( r, r );
		sprite.rotation = Math.PI*Math.random();

		sprite.scale = new Point( FLAKE_RADIUS/r,FLAKE_RADIUS/r );

		return sprite;

	}

	/**
	 * @param {number} r
	 * @param {number} segs
	 */
	makeFlakeTex( r, segs ){

		if ( (segs % 2) !== 0 ) segs++;

		let arc=2*Math.PI/segs;
		let tex = PIXI.RenderTexture.create( 2*r, 2*r );

		let g = this.drawArc( r, arc );

		let mat = new PIXI.Matrix();
		mat.translate(r,r);

		var theta = 0;
		this.renderer.render(g,tex,true, mat);

		for( let i = 1; i < segs; i++ ) {

			theta += arc;

			if ( i%2 === 0){
				g.rotation = theta;
				g.scale = new Point(1,1);
			} else {
				g.scale = new Point(1,-1);
				g.rotation = -(theta + arc);

			}

			this.renderer.render( g, tex, false, mat );

		}

		return tex;

	}

	drawArc( r, arc ){

		const c = new PIXI.Container();
		let g = new Graphics();
		g.mask = this.maskArc;

		//let s = randRange(0.7,1);
		//this.maskArc.scale.set( s,s )

		let p = new Point();

		this.drawSolid(g, p, (0.02+0.05*Math.random())*r );

		this.branch( g, p, 0, 1.4*r );
		//this.arcItems(g, r, arc );

		c.addChild(this.maskArc );
		c.addChild(g);


		return c;

	}

	branch( g, p0, angle, maxR ) {

		g.moveTo( p0.x, p0.y );

		var subR = ( 0.12 + 0.09*Math.random() )*maxR;
		/*if ( subR <= 8 ) { subR = maxR; }*/

		var p1 = new Point( p0.x + subR*Math.cos(angle), p0.y + subR*Math.sin(angle) );

		g.lineStyle( (0.02 + 0.05*Math.random())*DRAW_RADIUS, FLAKE_COLOR );
		this.drawShape(g, p1, subR );

		if ( subR <= 8 ) return;

		setLerp( p0, p1, 0.4 + 0.8*Math.random() );
		this.branch( g, p0,
			angle + ( Math.random() < 0.5 ? -1 : 1 ) *(33 + 33*Math.random()*DEG_TO_RAD ),
			(0.8+0.2*Math.random())*(maxR -subR)  );

		if ( maxR - subR > 8 ) {
			this.branch(g, p1, angle, maxR-subR );
		}


	}

	drawSolid( g, p, size ) {

		g.beginFill(FLAKE_COLOR);

		var n = Math.random();
		if ( n < 0.2 ) {

			g.drawShape( new PIXI.Ellipse(p.x,p.y, (0.5 + Math.random())*size, (0.5 + Math.random())*size ) );

		} else if ( n < 0.4 ) {

			g.drawShape( new PIXI.RoundedRectangle(p.x,p.y,
				(0.5 + Math.random())*size, (0.5 + Math.random())*size, Math.random()*size/8 ) );

		} else if ( n < 0.7 ) {

			g.drawStar( p.x, p.y, MAX_SEGS, size, size/2 );
		} else {

			g.drawRect( new PIXI.Rectangle( p.x, p.y, (0.5 + Math.random())*size, (0.5 + Math.random())*size ) );
		}
		g.endFill();

	}

	drawShape( g, p, size ) {

		//if ( size < 4 ) size = 4;
		var n = Math.random();
		if ( n < 0.05 ) {

			g.drawShape( new PIXI.Ellipse(p.x,p.y, (0.5 +0.3* Math.random())*size,(0.5 + 0.3*Math.random())*size ) );

		} else if ( n < 0.17 ) {

			g.drawShape( new PIXI.RoundedRectangle(p.x,p.y, (0.5 +1* Math.random())*size, (0.5 +1*Math.random())*size, Math.random()*size/8 ) );

		} else if ( n < 0.21 ) {

			g.drawCircle( p.x, p.y, (0.7+0.3*Math.random())*size );

		} else if ( n < 0.25 ) {

			g.drawRect( new PIXI.Rectangle( p.x, p.y, (0.7 +1* Math.random())*size,(0.7 + 1*Math.random())*size ) );
		}else {
			g.lineTo( p.x, p.y );

		}

	}

	makeSparkTex() {

		let bm = PIXI.RenderTexture.create( { width:2*SPARK_SIZE, height:2*SPARK_SIZE } );

		const g = new Graphics();
		g.beginFill( 0xffffff );
		g.drawStar( SPARK_SIZE, SPARK_SIZE, 3, SPARK_SIZE, SPARK_SIZE/2 );
		g.endFill();

		this.renderer.render( g, bm );
		this.sparkTex = bm;

	}

	/**
	 * Fill an arc of a circle.
	 * @param {*} minArc
	 * @param {*} arc
	 * @param {*} radius
	 * @param {*} fill
	 */
	fillArc( minArc, arc, radius=100, fill=0xffffff ){

		const g = new Graphics();
		g.interactive = false;
		g.buttonMode = false;

		g.moveTo(0,0);
		g.beginFill( fill );
		g.arc(0,0, radius, minArc, arc );
		g.endFill();

		return g;

	}

}