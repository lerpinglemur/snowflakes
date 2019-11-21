import { Graphics, DEG_TO_RAD, Polygon, Point } from "pixi.js";
import Gibbon, { Factory, Geom } from "../../../gibbon";

const { randInt, randRange} = Gibbon.Rand;
const { move, setReflect, reflection } = Gibbon.Geom;

import * as PIXI from 'pixi.js';


/**
 * @const {number} HOLE_COLOR - Pixi holes have a lot of limitations.
 * Should be easier to draw regular colors and transform on copy.
 */
const HOLE_COLOR = 0xFF0000;

const MIN_RADIUS = 50;
export const MAX_RADIUS = 80;


/**
 * @property {number} FLAKE_SIZE - base flake size.
 */
export const FLAKE_RADIUS = 20;

/**
 * Min/max arc gap as percent of arc.
 */
const MIN_GAP = 0.15;
const MAX_GAP = 0.3;

const MIN_SEGS = 6;
const MAX_SEGS = 6;

/**
 * Minimum/maximum cuts to make in flake arc.
 */
const MIN_CUTS = 2;
const MAX_CUTS = 4;

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

		//this.drawTex = PIXI.RenderTexture.create()
		//this.baseArc = this.makeArc( 2*Math.PI/MAX_SEGS );
		//this.maskArc = this.baseArc.clone();

	}

	createFlake( loc ){

		const sprite = new PIXI.Sprite();
		sprite.interactive = true;
		//sprite.buttonMode = true;

		if (!loc) loc = new Point();
		sprite.position.set( loc.x, loc.y );

		let r = MAX_RADIUS;
		const tex = this.flakeTex( r, randInt( MIN_SEGS, MAX_SEGS ) );
		sprite.texture = tex;
		sprite.pivot = new Point( r, r);

		sprite.scale = new Point( FLAKE_RADIUS/r, FLAKE_RADIUS/r );

	//	sprite.addChild(g);

		return sprite;

	}

	flakeTex( r=100, segs=16 ){

		if ( (segs % 2) !== 0 ) segs++;

		let arc=DEG_TO_RAD*(360/segs)
		let tex = PIXI.RenderTexture.create( 2*r, 2*r );

		let g = this.makeSnowArc( r, arc );

		let mat = new PIXI.Matrix();
		mat.translate(r,r);

		var theta = 0;
		for( let i = 0; i < segs; i++ ) {

			if ( i%2 === 1){
				g.scale = new Point(1,-1);
				g.rotation = -theta - arc;
			} else {
				g.rotation = theta;
				g.scale = new Point(1,1);
			}

			theta += arc;

			this.renderer.render( g, tex, false, mat );

		}

		return tex;

	}

	/**
	 * Create the base snowflake subarc.
	 * @param {number} fill
	 * @param {number} alpha
	 * @returns {PIXI.DisplayObject}
	 */
	makeSnowArc( radius=100, maxArc=360/16, fill=0xffffff ) {

		const clip = new PIXI.Container();

		let gap = Math.random() < 0.1 ? 0 : randRange( MIN_GAP, MAX_GAP );
		let minArc = gap*maxArc;
		maxArc -= minArc;

		const base = this.makeArc( minArc, maxArc, radius, fill );

		const cut = new Graphics();
		cut.blendMode = PIXI.BLEND_MODES.ERASE;
		//const mask = base.clone();
		//cut.mask = mask;


		this.cutArc(cut, minArc, maxArc, radius );
		this.cutArc(cut, maxArc, minArc, radius );

		/*
		let cuts = randInt( MIN_CUTS, MAX_CUTS );
		for( let i = 0; i < cuts; i++ ) {
			this.cutPoly(cut, radius, minArc, maxArc);
		}*/

		//clip.addChild( mask );
		clip.addChild( base );
		clip.addChild(cut);

		return clip;

	}

	makeArc( minArc, arc, radius=100, fill=0xffffff ){

		const g = new Graphics();
		g.interactive = false;
		g.buttonMode = false;

		g.moveTo(0,0);
		g.beginFill( fill );
		g.arc(0,0, radius, minArc, arc );
		g.endFill();

		return g;

	}

	/**
	 * Make cuts anywhere along the interior of an arc.
	 * @param {*} g
	 * @param {*} minArc
	 * @param {*} maxArc
	 * @param {*} radius
	 */
	randArcCuts( g, minArc, maxArc, radius ) {

		let r = 0.025;

		var cos1 = Math.cos(minArc);
		var sin1 = Math.sin(minArc);

		while ( r <= 1 ) {

			var dr = r + 0.05 + 0.2*Math.random();

			var a = randRange( minArc+0.1, (minArc+maxArc)/2 );
			var rmid = r + 0.2*Math.random();

			g.beginFill( HOLE_COLOR );
			g.drawPolygon( [r*radius*cos1, r*radius*sin1,
						(dr)*radius*cos1, (dr)*radius*sin1,
						rmid*radius*Math.cos(a), rmid*radius*Math.sin(a)] );
			g.endFill();

			r = dr;

		}

	}

	/**
	 * Make cuts along the edge of an arc.
	 * @param {Graphics} g
	 * @param {number} minArc
	 * @param {number} maxArc
	 * @param {*} radius
	 */
	cutArc( g, minArc, maxArc, radius ) {

		let r = 0.025;

		var cos1 = Math.cos(minArc);
		var sin1 = Math.sin(minArc);

		while ( r <= 1 ) {

			var dr = r + 0.05 + 0.2*Math.random();

			var a = randRange( minArc+0.1, (minArc+maxArc)/2 );
			var rmid = r + 0.2*Math.random();

			g.beginFill( HOLE_COLOR );
			g.drawPolygon( [r*radius*cos1, r*radius*sin1,
						(dr)*radius*cos1, (dr)*radius*sin1,
						rmid*radius*Math.cos(a), rmid*radius*Math.sin(a)] );
			g.endFill();

			r = dr;

		}

	}

	/**
	 * Cut (draw) a random polygon from a graphic.
	 * @param {*} g
	 * @param {*} r
	 * @param {*} minArc
	 * @param {*} maxArc
	 */
	cutPoly( g, r=100, minArc=0, maxArc=2*Math.PI ){

		let p = this.randPoly();

		let t = minArc + Math.random()*(maxArc-minArc);
		r = Math.random()*r;

		move( p, r*Math.cos(t), r*Math.sin(t) );

		g.beginFill( HOLE_COLOR,1);
		g.drawPolygon( p );
		g.endFill();

	}

	/**
	 * Create random polygon centered on 0,0.
	 * @param {number} minPoints
	 * @param {number} maxPoints
	 * @param {number} minRadius
	 * @param {number} maxRadius
	 * @returns {PIXI.Polygon}
	 */
	randPoly( minPoints=3, maxPoints=4, minRadius=4, maxRadius=10 ){

		const len = randInt(minPoints, maxPoints );
		const step = 2*Math.PI/maxPoints;

		let pts = new Array(len);
		let r, theta = 0;
		for( let i = 0; i < len; i++ ) {

			r = minRadius + Math.random()*(maxRadius-minRadius);
			pts[i] = new Point( r*Math.cos(theta), r*Math.sin(theta) );

			theta += step;

		}

		return new Polygon( pts );

	}

	// sprite swap reflect.
	/*flakeTex( r=100, segs=16 ){

		if ( segs % 2 !== 0 ) segs++;

		let arc=DEG_TO_RAD*(360/segs)
		let tex1 = PIXI.RenderTexture.create( 2*r, 2*r );
		let tex2 = PIXI.RenderTexture.create( 2*r, 2*r );

		let s1 = new PIXI.Sprite(tex1);
		let s2 = new PIXI.Sprite(tex2);

		let gap = Math.random() < 0.5 ? 0 : randRange( MIN_GAP, MAX_GAP );
		let g = this.makeSnowArc( r, arc*(1-gap) );

		let mat = new PIXI.Matrix();
		mat.translate(r,r);
		this.renderer.render(g, tex1, false,mat );

		var s3, tex3;
		for( let i = 1; i <4; i *=2 ) {

			var a = Math.cos(arc);
			var b = Math.sin(arc);
			setReflect(mat, a, b );
			arc*=2;

			this.renderer.render( s1, tex2, false, mat );
			tex3 = tex2;
			s3 = s1;

			s1 = s2;
			tex2 = tex1;

			s2 = s3;
			tex1 = tex3;


		}
		return tex1;

	}*/

}