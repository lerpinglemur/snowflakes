import { Component } from "gibbon.js";

export const EVT_STAT = 'stat';
export const EVT_SNOW = 'snow';
export const EVT_CHEER = 'cheer';
export const EVT_LOSE = 'freeze';

export const EVT_PLAY = 'play';
export const EVT_WIN = 'win';
export const EVT_MENU = 'menu';

/**
 * report stats.
 */
export const EVT_REPORT = 'report';

export const EVT_PAUSE = 'pause';

/**
 * Resume game in progress.
 */
export const EVT_RESUME = 'resume';

export const StatEvents = [
	EVT_SNOW,
	'magic',
	'comets',
	'specials'
];

export const WIN_SNOW = 1000;

export const MAX_CHEER = 100;

/**
 * Stats to share a values across multiple components/objects.
 */
export default class Stats extends Component {

	/**
	 * @property {number} snow - total snowflake count.
	 */
	get snow() { return this._snow;}
	set snow(v) {
		this._snow = v;
		this.emitter.emit( EVT_STAT, EVT_SNOW, v );
		this.emitter.emit( EVT_SNOW, v );
	}

	get cheer() { return this._cheer; }
	set cheer(v) {

		if ( v <= 0 ) {

			this.emitter.emit( EVT_LOSE, v );
			v = 0;

		} else if ( v > MAX_CHEER ) {
			v = MAX_CHEER;

		}
		this._cheer=v;

		let f = Math.floor(v);
		if ( f !== this._lastCheer ) {

			this._lastCheer = f;
			this.emitter.emit( EVT_CHEER, f );

		}

	}

	/**
	 * @property {number} clicks - user clicks.
	 */
	get clicks(){return this._clicks;}
	set clicks(v){this._clicks=v;}

	/**
	 * @property {number} spawners - spawners clicked.
	 */
	get spawners(){return this._spawners;}
	set spawners(v) {
		this._spawners = v;
		this.emitter.emit( EVT_STAT, 'magic', v );
	}

	get comets() { return this._comets; }
	set comets(v) {
		this._comets = v;
		this.emitter.emit( EVT_STAT, 'comets', v );
	}

	get specials(){return this._specials; }
	set specials(v) {
		this._specials = v;
		this.emitter.emit( EVT_STAT, 'specials', v);

		if ( this._snow > WIN_SNOW ) {
			this.emitter.emit( EVT_WIN );
		}

	}

	/**
	 * Reset stats.
	 */
	reset(){

		this._snow = 0;
		this._clicks = 0;
		this._spawners = 0;
		this._comets = 0;
		this._specials = 0;

		this._lastCheer = 0;
		this._cheer = MAX_CHEER;

	}

	init(){

		this.emitter = this.game.emitter;
		this.reset();

	}

}