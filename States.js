function FSM(params) {

/*
машина состояний.
Состояния:

playing	- идет игра;
GameOver - игра окончена;
pause - игра на паузе;
inactive - игра еще не начата.
*/

var sm = this;


var step_func = params.step_func;
var iface = params.iface;
var render = params.render;
var game = params.game;
var control = params.control;
var glass = params.glass;
var step;
var fig;

var event_fast_stop_blink = new Event("fast_stop_blink");
var current_state = "inactive";


	sm.setFigureFunc = function(fig_func) {
		fig = fig_func;
	}

// Объект состояний определяет, из какого в какое состояние разрешен или запрещен переход

var states_permissions = {
		playing: {
			playing: false,
			pause: true,
			gameover: true,
			inactive: false,
			blinking: true
		},
		pause: {
			playing: true,
			pause: false,
			gameover: true,
			inactive: false,
			blinking: false
		},
		gameover: {
			playing: true,
			pause: false,
			gameover: false,
			inactive: false,
			blinking: false
		},
		inactive: {
			playing: true,
			pause: false,
			gameover: false,
			inactive: true,
			blinking: false
		},
		blinking: {
			playing: true,
			pause: true,
			gameover: true,
			inactive: false,
			blinking: false
		}
	}

// Методы состояний

	function stateStart() {
		current_state = "playing";
		iface.hideMessage();
		control.Activate();
		game.setStartStep();
		step = setInterval(step_func, 40);
	}

	function stateInactive() {
		current_state = "inactive";
		iface.showMessage('Press Start');
	}

	function statePause() {
		clearInterval(step);
		control.Deactivate();
		control.resetControl();
		current_state = "pause";
		iface.showMessage('Paused');
	}

	function stateGameOver() {
		clearInterval(step);
		control.Deactivate();
		control.resetControl();
		current_state = "gameover";
		iface.showMessage('Game Over');
		iface.resetGame();
	}

	function stateBlink() {
		clearInterval(step);
		current_state = "blinking";
		control.resetControl();
	}

	function stateUnBlink() {
		step = setInterval(step_func, 40);
		current_state = "playing";
	}

// Метод переключения состояний

	sm.setState = function(request_state) {
		
		if (!states_permissions[current_state][request_state]) return;

		switch (request_state) {
			case "playing":
				if (current_state == "blinking") {
					stateUnBlink();
				} else if (current_state === "pause") {
					stateStart();
				} else {
					render.clearGame(glass);
					fig.Next();
					stateStart();
				}
				break;
			case "pause":
				if (current_state == "blinking") {
					document.dispatchEvent(event_fast_stop_blink);
				}

				statePause();
				break;
			case "gameover":
				if (current_state == "blinking") {
					document.dispatchEvent(event_fast_stop_blink);
				}

				stateGameOver();
				break;
			case "inactive":
				stateInactive();
				break;
			case "blinking":
				stateBlink();
				break;
		}
	}
}