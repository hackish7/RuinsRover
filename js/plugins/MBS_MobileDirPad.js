//=============================================================================
// MBS - Mobile Dir Pad (v1.2.0)
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
// Plugin specifications (Do not modify!)
//
/*:
 @author Masked
 @plugindesc This script creates a DirPad and a action button for touch
 devices in order to make the movement better.
 <MBS MobileDirPad>
 @help
 =============================================================================
 Introduction
 =============================================================================
 This script creates DirPad and Action Button images on touch devices to make
 the controls easier to use.

 =============================================================================
 How to use
 =============================================================================
 If you want to erase an action button, just leave its image path empty. 

 If you want to disable/enable the plugin, use these plugin commands:

 MobileDirPad disable
 MobileDirPad enable

 You might also want to use diagonal movement with this script, this is 
 possible now, just add the 8D movement plugin to your project and everything
 should work fine.

 =============================================================================
 Credits
 =============================================================================
 - Masked, for creating

 @param DPad Image
 @desc The file path for the DPad image
 @default ./img/system/DirPad.png

 @param ActionButton Image
 @desc The file path for the Action Button image
 @default ./img/system/ActionButton.png

 @param ActionButton2 Image
 @desc The file path for the Action Button image
 @default ./img/system/ActionButton.png

 @param CancelButton Image
 @desc The file path for the Cancel Button image
 @default ./img/system/CancelButton.png

 @param Button Size
 @desc The DPad buttons size
 @default 52

 @param DPad Position
 @desc The DirPad image position on screen (on format x; y)
 @default 10; 70

 @param ActionButton Position
 @desc The ActionButton image position on screen (on format x; y)
 @default 90; 80

 @param ActionButton2 Position
 @desc The ActionButton2 image position on screen (on format x; y)
 @default 90; 80

 @param CancelButton Position
 @desc The ActionButton image position on screen (on format x; y)
 @default 80; 90

 @param Opacity
 @desc The opacity used on the DPad and Action Button
 @default 255

 @param Hide Duration
 @desc Number of frames the UI hiding take
 @default 15

 @param PC Debug
 @desc Set to 'true' if you want to debug the script on a computer and to 'false' otherwise.
 @default true

 @param Only in Map
 @desc Set to 'true' if you want the dpad to show up just at the map scene and to 'false' otherwise.
 @default false
*/

var Imported = Imported || {};
var MBS = MBS || {};

MBS.MobileDirPad = {};

"use strict";

(function ($) {

	//-----------------------------------------------------------------------------
	// Setup
	//

	$.Parameters = $plugins.filter(function(p) {return p.description.contains('<MBS MobileDirPad>');})[0].parameters;
	$.Param = $.Param || {};

	$.Param.size = Number($.Parameters["Button Size"]);

	$.Param.dpad = $.Parameters["DPad Image"];
	$.Param.button = $.Parameters["ActionButton Image"];
	$.Param.bButton = $.Parameters["ActionButton2 Image"];
	$.Param.cButton = $.Parameters["CancelButton Image"];

	var dposition = $.Parameters["DPad Position"].split(";");
	$.Param.dpadPositionPercent = new PIXI.Point(Number(dposition[0]), Number(dposition[1]));
	$.Param.dpadPosition = new PIXI.Point(-1000, -1000);

	var bposition = $.Parameters["ActionButton Position"].split(";");
	$.Param.buttonPositionPercent = new PIXI.Point(Number(bposition[0]), Number(bposition[1]));
	$.Param.buttonPosition = new PIXI.Point(-1000, -1000);

	var bBposition = $.Parameters["ActionButton2 Position"].split(";");
	$.Param.bButtonPositionPercent = new PIXI.Point(Number(bBposition[0]), Number(bBposition[1]));
	$.Param.bButtonPosition = new PIXI.Point(-1000, -1000);

	var cposition = $.Parameters["CancelButton Position"].split(";");
	$.Param.cButtonPositionPercent = new PIXI.Point(Number(cposition[0]), Number(cposition[1]));
	$.Param.cButtonPosition = new PIXI.Point(-1000, -1000);

	$.Param.opacity = Number($.Parameters["Opacity"]);

	$.Param.hideDuration = Number($.Parameters["Hide Duration"]);

	$.Param.pcDebug = ($.Parameters["PC Debug"].toLowerCase() === "true") && Utils.isOptionValid('test');
	$.Param.onlyMap = ($.Parameters["Only in Map"].toLowerCase() === "true");
 
 	//-----------------------------------------------------------------------------
	// Module functions
	//

 	$.enable = function(flag) {
		Scene_Base.dirpad = flag;
		if (flag) {
			SceneManager._scene.showUserInterface();
		} else {
			SceneManager._scene.hideUserInterface();
		}
	};

	//-----------------------------------------------------------------------------
	// Sprite_DirPad
	//
	// Sprite for the Directional Pad

	function Sprite_DirPad() {
		this.initialize.apply(this, arguments);
	}

	Sprite_DirPad.prototype = Object.create(Sprite_Base.prototype);
	Sprite_DirPad.prototype.constructor = Sprite_DirPad;

	Sprite_DirPad.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this.bitmap = ImageManager.loadNormalBitmap($.Param.dpad, 0);
		this.anchor.y = 0.5;
		this.anchor.x = 0.5;
		this.z = 5;
		this._lastDir = '';
	};

	Sprite_DirPad.prototype.update = function() {
		Sprite_Base.prototype.update.call(this);
		if (!this.visible) return;
		this.updateMovement();
		this.updateTouch();
	};

	Sprite_DirPad.prototype.updateMovement = function() {
		if (this._moveDuration > 0) {
			this.x += this._moveSpeed;
			this._moveDuration--;
		}
	};

	Sprite_DirPad.prototype.updateTouch = function() {
		if (this._lastDir.length > 0) {
			this._lastDir.split(" ").forEach(function (d) { 
				Input._currentState[d] = false; 
			});
			this._lastDir = '';
		}

		var s = $.Param.size;

		if (TouchInput.isPressed()) {
			var sx = this.x - this.width * this.anchor.x;
			var sy = this.y - this.height * this.anchor.y;
			var rect = this.getBounds();
			
			this._lastDir = '';

			if (rect.contains(TouchInput.x,TouchInput.y) && TouchInput.x - rect.x > s * 2) {
				Input._currentState['right'] = true;
				this._lastDir = 'right';
			} else if (rect.contains(TouchInput.x,TouchInput.y) && TouchInput.x - rect.x < s) {
				Input._currentState['left'] = true;
				this._lastDir = 'left';
			} 
			if (rect.contains(TouchInput.x,TouchInput.y) && TouchInput.y - rect.y > s * 2) {
				Input._currentState['down'] = true;
				this._lastDir += ' down';
			} else if (rect.contains(TouchInput.x,TouchInput.y) && TouchInput.y - rect.y < s) {
				Input._currentState['up'] = true;
				this._lastDir += ' up';
			}
			this._lastDir = this._lastDir.trim();
		}
	};

	Sprite_DirPad.prototype.hide = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = 0 - 64 - this.width * (1 + this.anchor.x);
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	};

	Sprite_DirPad.prototype.show = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = $.Param.dpadPosition.x;
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	};

	//-----------------------------------------------------------------------------
	// Sprite_ActionButton
	//
	// Sprite for the action button

	function Sprite_Button() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Button.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Button.prototype.constructor = Sprite_Button;

	Sprite_Button.prototype.getButtonByType = function(type) {
		var button = "";
		switch (type)
		{
		case 0:
			button = $.Param.button;
			break;
		case 1:
			button = $.Param.bButton;
			break;
		case 2:
			button = $.Param.cButton;
			break;
		}

		console.log ("getButtonByType : " + type + " : " + button);

		return button;
	}

	Sprite_Button.prototype.initialize = function(type) {
		Sprite_Base.prototype.initialize.call(this);
		this._type = type;

		var button = this.getButtonByType (type);

		if (button == "")
		{
			this.visible = false;
		}
		else
		{
			this.bitmap = ImageManager.loadNormalBitmap(button, 0);	
		}

		this.anchor.y = 0.5;
		this.anchor.x = 0.5;
		this._moveDuration = 0;
		this._moveSpeed = 0;
		this.z = 5;
	};

	Sprite_Button.prototype.update = function() {
		Sprite_Base.prototype.update.call(this);
		if (!this.visible) return;
		this.updateMovement();
		this.updateTouch();
	};

	Sprite_Button.prototype.updateMovement = function() {
		if (this._moveDuration > 0) {
			this.x += this._moveSpeed;
			this._moveDuration--;
		}
	};

	Sprite_Button.prototype.updateTouch = function() {

		if (this._type == 0)
		{
			if ( TouchInput.isPressed()) {
				var rect = new PIXI.Rectangle(this.x - this.width * this.anchor.x, this.y - this.height * this.anchor.y, this.width, this.height);
				Input._currentState['ok'] = rect.contains(TouchInput.x, TouchInput.y);
			} else {
				Input._currentState['ok'] = false;
			}
		}
		else if (this._type == 1)
		{
 			if (TouchInput.isTriggered()) {
				var rect = new PIXI.Rectangle(this.x - this.width * this.anchor.x, this.y - this.height * this.anchor.y, this.width, this.height);
				Input._currentState['shift'] = rect.contains(TouchInput.x, TouchInput.y);
			} else {
				Input._currentState['shift'] = false;
			}
		}
		else if (this._type == 2)
		{
			if ( TouchInput.isTriggered()) {
				var rect = new PIXI.Rectangle(this.x - this.width * this.anchor.x, this.y - this.height * this.anchor.y, this.width, this.height);
				Input._currentState['escape'] = rect.contains(TouchInput.x, TouchInput.y);
			} else {
				Input._currentState['escape'] = false;
			}
		}
		
		/*
		if (this._type == 0 && TouchInput.isPressed()) {
			var rect = new PIXI.Rectangle(this.x - this.width * this.anchor.x, this.y - this.height * this.anchor.y, this.width, this.height);
			Input._currentState['ok'] = rect.contains(TouchInput.x, TouchInput.y);
		} else if (this._type == 0) {
			Input._currentState['ok'] = false;
		} else if (this._type == 1 && TouchInput.isTriggered()) {
			var rect = new PIXI.Rectangle(this.x - this.width * this.anchor.x, this.y - this.height * this.anchor.y, this.width, this.height);
			Input._currentState['escape'] = rect.contains(TouchInput.x, TouchInput.y);
		} else if (this._type == 1) {
			Input._currentState['escape'] = false;
		}
		*/
	};

	Sprite_Button.prototype.getButtonPosition = function(type) {
		switch (type)
		{
			case 0:
				return $.Param.buttonPosition;
			case 1:
				return $.Param.bButtonPosition;
			case 2:
				return $.Param.cButtonPosition;
		}
		return $.Param.buttonPosition;
	}

	Sprite_Button.prototype.hide = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = Graphics.width + this.width * this.anchor.x + 64;
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	}

	Sprite_Button.prototype.show = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = this.getButtonPosition(this._type).x;
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	}

	//-----------------------------------------------------------------------------
	// Scene_Map
	//
	// The base scene class for all other scenes

	var Scene_Map_start = Scene_Map.prototype.start;
	var Scene_Map_update = Scene_Map.prototype.update;

	Scene_Map.prototype.isMobileDevice = function() {
		return Utils.isMobileDevice() || $.Param.pcDebug;
	};

	Scene_Map.dirpad = true;

	Scene_Map.prototype.start = function() {
	    Scene_Map_start.apply(this, arguments);
	    Scene_Map.dirpad = Scene_Map.dirpad && this.isMobileDevice();

	    if (!$.Param.onlyMap || this instanceof Scene_Map) {
		    this.createDirPad();
		    this.createActionButtons();
		    $.enable(Scene_Map.dirpad);
		}
	};

	Scene_Map.prototype.update = function() {
		Scene_Map_update.apply(this, arguments);
		if (this.isMobileDevice() && this._dirPad != undefined && this._aButton != undefined && this._bButton != undefined && this._cButton != undefined)
			this._dirPad.visible = this._aButton.visible = this._bButton.visible = this._cButton.visible = Scene_Map.dirpad;
	};

	Scene_Map.prototype.createDirPad = function() {
		this._dirPad = new Sprite_DirPad();
		this._dirPad.opacity = $.Param.opacity;

		var x = Graphics.width * ($.Param.dpadPositionPercent.x/100);
		var y = Graphics.height * ($.Param.dpadPositionPercent.y/100);
		$.Param.dpadPosition.x = x;
		$.Param.dpadPosition.y = y;

		this._dirPad.x = $.Param.dpadPosition.x;
		this._dirPad.y = $.Param.dpadPosition.y;

		this.addChild(this._dirPad);
	};

	Scene_Map.prototype.createActionButtons = function() {

		// action button
		this._aButton = new Sprite_Button(0);
		this._aButton.opacity = $.Param.opacity;

		var x = Graphics.width * ($.Param.buttonPositionPercent.x/100);
		var y = Graphics.height * ($.Param.buttonPositionPercent.y/100);
		$.Param.buttonPosition.x = x;
		$.Param.buttonPosition.y = y;

		this._aButton.x = $.Param.buttonPosition.x;
		this._aButton.y = $.Param.buttonPosition.y;

		// b button
		this._bButton = new Sprite_Button(1);
		this._bButton.opacity = $.Param.opacity;

		var x = Graphics.width * ($.Param.bButtonPositionPercent.x/100);
		var y = Graphics.height * ($.Param.bButtonPositionPercent.y/100);
		$.Param.bButtonPosition.x = x;
		$.Param.bButtonPosition.y = y;

		this._bButton.x = $.Param.bButtonPosition.x;
		this._bButton.y = $.Param.bButtonPosition.y;
		console.log ("B button : " + this._bButton.x + ", " + this._bButton.y);

		//cancel button
		this._cButton = new Sprite_Button(2);
		this._cButton.opacity = $.Param.opacity;

		var x = Graphics.width * ($.Param.cButtonPositionPercent.x/100);
		var y = Graphics.height * ($.Param.cButtonPositionPercent.y/100);
		$.Param.cButtonPosition.x = x;
		$.Param.cButtonPosition.y = y;
		this._cButton.x = $.Param.cButtonPosition.x;
		this._cButton.y = $.Param.cButtonPosition.y;
		console.log ("C button : " + this._cButton.x + ", " + this._cButton.y);

		this.addChild(this._aButton);
		this.addChild(this._bButton);
		this.addChild(this._cButton);
	};

	Scene_Map.prototype.hideUserInterface = function() {
		this._dirPad.hide();
		this._aButton.hide();
		this._bButton.hide();
		this._cButton.hide();
	};

	Scene_Map.prototype.showUserInterface = function() {
		this._dirPad.show();
		this._aButton.show();
		this._bButton.show();
		this._cButton.show();
	};


	//-----------------------------------------------------------------------------
	// Scene_Map
	//
	// The map scene

	var Scene_Map_createMessageWindows = Scene_Map.prototype.createMessageWindow;
	var Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
	var Scene_Map_terminate = Scene_Map.prototype.terminate;

	Scene_Map.prototype.createMessageWindow = function() {
		Scene_Map_createMessageWindows.call(this);
		var oldStartMessage = this._messageWindow.startMessage;
		var oldTerminateMessage = this._messageWindow.terminateMessage;
		var scene = this;
		this._messageWindow.startMessage = function() {
			oldStartMessage.apply(this, arguments);
			scene.hideUserInterface();
		};
		Window_Message.prototype.terminateMessage = function() {
		    oldTerminateMessage.apply(this, arguments);
		    scene.showUserInterface();
		};
	};

	Scene_Map.prototype.terminate = function() {
		if (this.isMobileDevice())
		{
	    	this._dirPad.visible = this._aButton.visible = this._bButton.visible = this._cButton.visible = false;
		}

		Scene_Map_terminate.apply(this, arguments);
	};

	Scene_Map.prototype.processMapTouch = function() {
		if (!(this.isMobileDevice() && Scene_Base.dirpad)) Scene_Map_processMapTouch.apply(this, arguments);
	};

	//-----------------------------------------------------------------------------
	// Plugin Command
	//

  	var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

  	Game_Interpreter.prototype.pluginCommand = function (command, args) {
  		_GameInterpreter_pluginCommand.apply(this, arguments);

  		if (command == "MobileDirPad") {
  			if (args[0] == "enable") {
  				$.enable(true);
  			} else if (args[0] == "disable") {
  				$.enable(false);
  			}
  		}
  	};

})(MBS.MobileDirPad);

Imported["MBS_MobileDirPad"] = 1.1;

if (Imported["MVCommons"]) {
  	PluginManager.register("MBS_MobileDirPad", 1.1, "Shows a DirPad and action buttons when using mobile devices", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "31-10-2015");
}
