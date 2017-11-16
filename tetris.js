function Tetris (options) {

/*
Главный игровой объект
*/

	var scope = this;

// Назначение исходных переменных и свойств

	var dx = options.CELL_WIDTH;
	var dy = options.CELL_HEIGHT;
	var x_cells = options.X_CELLS;
	var y_cells = options.Y_CELLS;
	var ctx_fig = options.ctx_fig;
	var ctx_glass = options.ctx_glass;
	var game_area = options.game_area;

	var width = x_cells * dx;
	var height = y_cells * dy;

	var i, j;
	var current_press;

	var glass = [];
	var origin_fall_delta = options.fall_delta;
	var fall_delta = options.fall_delta;
	var level_boost_fall_delta = options.level_boost_fall_delta;
	var current_figure = {
		index: 0,
		matrix: [],
		position: [0, 0],
		phase: 0,
		center: [0, 0]
	}
	// console.log(current_figure);
	var start_step;
	var check_fall;

	scope.setStartStep = function() {
		start_step = new Date();
	}

	var render = options.renderer;
	var control = new Control(options);
	var iface = new Interface(options);

	var params = {
		render: options.renderer,
		ctx_fig: options.ctx_fig,
		ctx_glass: options.ctx_glass,
		step_func: gameStep,
		iface: iface,
		game: scope,
		game_area: options.game_area,
		control: control,
		glass: glass,
		current_figure: current_figure,
		width: width,
		height: height,
		dx: dx,
		dy: dy
	}

	var blink = new Blinking(params);
	var fsm = new FSM(params);
	var figure = new Figure(options, params, fsm, blink);

// Передача функции фигуры в State Machine

	fsm.setFigureFunc(figure);

// Установка предигрового состояния

	fsm.setState('inactive');

// Включение игрового интерфейса

	iface.setButtonControls(fsm);

// Заполнение стакана нулями

	fillZeroGlass();

// Установка слушателей для управления

	game_area.addEventListener("left", getControl);
	game_area.addEventListener("right", getControl);
	game_area.addEventListener("up", getControl);
	game_area.addEventListener("down", getControl);
	game_area.addEventListener("space", getControl);
	game_area.addEventListener("release", getControl);
	game_area.addEventListener("level_up", levelUp);
	game_area.addEventListener("reset_game", fall_delta_normalize);

// Метод игрового шага

	function gameStep () {
		AutoFall();
		getControl(control.getControl());
	}

// Метод заполнения стакана нулями

	function fillZeroGlass () {
		for (i = 0; i <= y_cells - 1; i++) {
			glass[i] = [];
			for (j = 0; j <= x_cells - 1; j++) {
				glass[i][j] = 0;
			}
		}
	}

// Метод автопадения

	function AutoFall() {
		check_fall = new Date();

		if (figure.Move("down", "justCheck")) {
			if (check_fall - start_step >= fall_delta) {
				figure.Move("down");
				render.Figure(ctx_fig, current_figure.position[0], current_figure.position[1], current_figure.matrix);
				start_step = new Date();
			}
		} else {
			figure.toGlass(current_figure.position[0], current_figure.position[1]);
			start_step = new Date();
		}
	}

// Метод, обрабатывающий управления

	function getControl(e) {
		if (e === undefined) return;
		var ctrl = (e.type === undefined) ? e : e.type;

		switch (ctrl) {
			case "left":
				if (figure.Move("left")) {
					render.Figure(ctx_fig, current_figure.position[0], current_figure.position[1], current_figure.matrix);
				}
				break;
			case "right":
				if (figure.Move("right")) {
					render.Figure(ctx_fig, current_figure.position[0], current_figure.position[1], current_figure.matrix);
				}
				break;
			case "up":
				if (figure.Move("rotate")) {
					render.Figure(ctx_fig, current_figure.position[0], current_figure.position[1], current_figure.matrix);
				}
				break;
			case "space":
				figure.Drop();
				break;
		}

		if (ctrl == "down") {
			fall_delta /= 2;
		} else fall_delta = origin_fall_delta;
	}

// Метод повышения уровня

	function levelUp() {
		fall_delta = origin_fall_delta /= level_boost_fall_delta;
	}

// Метод сброса дельты падения фигуры

	function fall_delta_normalize() {
		fall_delta = origin_fall_delta = options.fall_delta;
	}
}