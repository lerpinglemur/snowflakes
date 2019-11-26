import { Group } from "gibbon.js";
import { CounterFld } from 'pixiwixi';
import { Point, Graphics, Text } from "pixi.js";
import WinView from "./winView";
import LoseView from "./loseView";
import HelpView from "./helpView";
import GameUI from "./gameUI";
import MenuView from "./menuView";

export const CHEER_COLOR = 0x0091ff;

const TEXT_COLOR = 0xffffff;
const BASE_COLOR = 0xf5f6f7;
const HILITE_COLOR = 0xffffff;
const PANE_ALPHA = 0.4;

const FONT_NAME = 'Snowburst One'; // thin, large
//const FONT_NAME = 'Mountains of Christmas'; // slightly cramped?

const PANE_WIDTH = 0.8;
const PANE_HEIGHT = 0.8;

const PADDING = 24;

export const FontStyle = {
	fontFamily:FONT_NAME, fill:TEXT_COLOR,
	fontSize:24
};

const SmallStyle = Object.assign( {}, FontStyle );
SmallStyle.fontSize = 16;

export const MakeHiliter = (targ) => {
	return gsap.to( targ, { duration:0.5, tint:HILITE_COLOR } );
}

export const MakeClose = () => {

}

export const MakeText = (text )=>{

	let t = new Text( text, FontStyle );
	t.tint = TEXT_COLOR;

	return t;

}

export const MakeSubText = (text)=>{

	let t = new Text( text, SmallStyle );
	t.tint = TEXT_COLOR;
	return t;

}

export const TextButton = (text, fn, context)=>{

	var t = MakeText(text);
	t.interactive = true;

	if ( fn ) t.on('click', fn, context );

	return t;

}

export const MakeBg = ( dest, width, height, color=0, alpha=PANE_ALPHA ) => {

	var g = new Graphics();
	g.beginFill( color, alpha );
	g.drawRect( 0, 0, width, height );
	g.endFill();
	g.cacheAsBitmap = true;

	dest.addChild(g);

	return g;

}

export default class UIGroup extends Group {

	get curView(){
		return this._curView;
	}
	set curView(v) {

		let prev = this._curView;

		this._curView = v;
		this.centerPane( v );
		this.clip.addChild(v);
		v.visible = true;

		if ( prev && prev !== v ) {
			prev.visible = false;
			this.clip.removeChild( prev );
		}

	}

	constructor( game, layer ){

		super( game, layer );

		this.view = this.game.screen;

	}

	centerPane(pane){
		pane.position.set( (this.view.width - pane.width)/2, (this.view.height-pane.height)/2 );
	}

	showMenu() {

		if ( !this.mainMenu ) this.mainMenu = new MenuView( this.game, PADDING );
		this.curView = this.mainMenu;
		this.clip.addChild( this.mainMenu );

	}

	hideMenu() {

		this.mainMenu.visible = false;
		this.clip.removeChild( this.mainMenu );

	}

	showWin() {

		let winPane = new WinView( this.game, PADDING );
		this.clip.addChild( winPane );
		this.centerPane( winPane );

	}

	showLose() {

		let losePane = new LoseView( this.game, PADDING );
		this.clip.addChild( losePane );
		this.centerPane( losePane );

	}

	showHelp(){

		if ( !this.helpView ) {
			this.helpView = new HelpView( this.game, PADDING );
		}
		this.curView = this.helpView;

	}
	hideHelp(){

		if ( this.helpView){
			this.clip.removeChild(this.helpView);
			this.helpView.destroy();
			this.helpView = null;
		}
		if ( this.game.controller == null ){
			this.showMenu();
		}

	}

	showGameView() {

		if ( !this.gameView ) {
			this.gameView = new GameUI( this.game, PADDING );
			this.clip.addChild( this.gameView );
		}
		this.gameView.visible = true;
		return this.gameView;

	}

	hideGameView() {

		if ( this.gameView ) {
			this.gameView.visible = false;
		}

	}

}