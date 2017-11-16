function Render (options) {

var scope = this;

// Задание исходных переменных

var x_cells = options.X_CELLS;
var y_cells = options.Y_CELLS;
var dx = options.CELL_WIDTH;
var dy = options.CELL_HEIGHT;
var parent = options.container;

var ctx_glass;
var ctx_fig;

var i = 0;

// Расчет размеров в пикселях

var width = x_cells * dx;
var height = y_cells * dy;

// Рендер тетриса - создание и вставка элементов DOM. Отрисовка сетки.

scope.createDOM = function () {

// Создание элементов DOM

	var tetris_table = document.createElement("table");
	tetris_table.id = 'tetris_table';

	var tbody = document.createElement("tbody");
	var tr = document.createElement("tr");

	var tetris_td = document.createElement("td");
	tetris_td.id = "tetris_td";

	var interface_td = document.createElement("td");
	interface_td.id = "interface_td";

	var fig_canvas = document.createElement("canvas");
	fig_canvas.id = "Figures";
	fig_canvas.className = "layer";

	var grid_canvas = document.createElement("canvas");
	grid_canvas.id = "Grid";
	grid_canvas.className = "layer";

	var glass_canvas = document.createElement("canvas");
	glass_canvas.id = "Glass";
	glass_canvas.className = "layer";

	var back = document.createElement("div");
	back.id = "back";
	back.className = "layer";

	var scores = document.createElement("div");
	scores.id = "scores";
	scores.innerHTML = "Scores: 0";

	var level = document.createElement("div");
	level.id = "level";
	level.innerHTML = "Level: 0";

	var start = document.createElement("div");
	start.id = "start";
	start.className = "tetris_buttons";
	start.innerHTML = "Start";

	var pause = document.createElement("div");
	pause.id = "pause";
	pause.className = "tetris_buttons";
	pause.innerHTML = "Pause";

	var stop = document.createElement("div");
	stop.id = "stop";
	stop.className = "tetris_buttons";
	stop.innerHTML = "Stop";

	var sound_container = document.createElement("div");
	sound_container.id = "sound";

	var sound_symbol = document.createElement("canvas");
	sound_symbol.id = "sound_symbol";

	var sound_control = document.createElement("canvas");
	sound_control.id = "sound_control";

// Вставка элементов DOM

	tetris_table.appendChild(tbody);

	tbody.appendChild(tr);

	tr.appendChild(tetris_td);
	tr.appendChild(interface_td);

	tetris_td.appendChild(fig_canvas);
	tetris_td.appendChild(grid_canvas);
	tetris_td.appendChild(glass_canvas);
	tetris_td.appendChild(back);

	interface_td.appendChild(sound_container);
	interface_td.appendChild(document.createElement("br"));

	sound_container.appendChild(sound_control);
	sound_container.appendChild(sound_symbol);
	
	interface_td.appendChild(level);
	interface_td.appendChild(document.createElement("br"));
	interface_td.appendChild(scores);
	interface_td.appendChild(document.createElement("br"));
	interface_td.appendChild(start);
	interface_td.appendChild(document.createElement("br"));
	interface_td.appendChild(pause);
	interface_td.appendChild(document.createElement("br"));
	interface_td.appendChild(stop);

	parent.appendChild(tetris_table);

	ctx_fig = options.ctx_fig = document.getElementById("Figures").getContext('2d');
	ctx_glass = options.ctx_glass = document.getElementById("Glass").getContext('2d');

	options.message_back_plane = document.getElementById("back");
	options.start_button = document.getElementById("start");
	options.pause_button = document.getElementById("pause");
	options.stop_button = document.getElementById("stop");
	options.game_area = document.getElementById("tetris_table");
	options.scores = document.getElementById("scores");
	options.level = document.getElementById("level");
	options.sound = document.getElementById("sound_control");
}
// Установка размеров игровой области

scope.setSizes = function () {
	var game_area = document.getElementsByClassName('layer');

	for (var i = 0; i < game_area.length; i++) {
		game_area[i].width = width;
		game_area[i].height = height;
	}

	document.getElementById('tetris_td').width = width;
	document.getElementById('tetris_td').height = height;

	document.getElementById('sound_control').width = '50';
	document.getElementById('sound_control').height = '50';
	document.getElementById('sound_symbol').width = '50';
	document.getElementById('sound_symbol').height = '50';
}

// Отрисовка сетки

scope.Grid = function () {

// получение элемента canvas
	var grid = document.getElementById("Grid");
	var ctx = grid.getContext('2d');

// очистка canvas, затем отрисовка линий сетки

	ctx.clearRect(0, 0, width, height);

	for (i = 0; i <= width; i += dx) {
		ctx.moveTo(i, 0);
		ctx.lineTo(i, height);
	}

	for (i = 0; i <= height; i += dy) {
		ctx.moveTo(0, i);
		ctx.lineTo(width, i);
	}

// задание параметров линий

	ctx.lineWidth = 3;
	ctx.strokeStyle = 'white';
	ctx.stroke();
}

scope.Sound = function() {
	var ctx = document.getElementById("sound_symbol").getContext('2d');

	ctx.fillStyle = 'black';
	ctx.fillRect(15, 15, 10, 20);
	ctx.beginPath();
	ctx.moveTo(25, 15);
	ctx.lineTo(35, 5);
	ctx.lineTo(35, 45);
	ctx.lineTo(25, 35);
	ctx.closePath();
	ctx.fill();

	ctx = document.getElementById("sound_control").getContext('2d');

	ctx.strokeStyle = 'black';
	ctx.lineWidth = 4;
	ctx.moveTo(0, 0);
	ctx.lineTo(50, 50);
	ctx.moveTo(50, 0);
	ctx.lineTo(0, 50);
	ctx.stroke();
}

// Метод отрисовки одного блока

scope.Block = function (ctx, x0, y0, x, y) {
	ctx.strokeStyle = 'white';
	ctx.fillStyle = 'black';
	ctx.fillRect(x0, y0, x, y);
	ctx.strokeRect(x0, y0, x, y);
}

// Метод рендеринга фигуры

scope.Figure = function (ctx, x0, y0, matrix) {
	
	var i, j;
	var x, y;
	// console.log(x0, y0);

	var x_length = matrix[0].length;
	var y_length = matrix.length;

	if (ctx == ctx_fig) ctx.clearRect(0, 0, width, height);

	for (i = 0; i < y_length; i++) {
		
		y = y0 + dy * i;

		for (j = 0; j < x_length; j++) {
			if (matrix[i][j] === 1) {
				x = x0 + dx * j;
				scope.Block(ctx, x, y, dx, dy);
			}
		}
	}
}

// Метод отрисовки стакана после удаления строк из него

scope.updateGlass = function (glass, delete_rows) {

	var i, j;

// В j записываем число строк стакана. Далее смещаем строки, которые не будут удаляться, вниз.

	j = y_cells - 1;

	for (i = y_cells - 1; i >= 0; i--) {
		if (delete_rows.indexOf(i) === -1) {
			glass[j] = glass[i];
			j--;
		}
	}

// Если мы остановились не на нулевой строке, то все вышестоящие строки стакана заполняем нулями, т.к. все что нужно - переместилось.
	
	if (j >= 0) {
		for (i = 0; i <= j; i++) {
			glass[i] = glass[i].map(function() {
				return 0;
			});
		}
	}
	
// Очищаем CANVAS стакана и перерисовываем его.

	ctx_glass.clearRect(0, 0, width, height);

	for (i = 0; i < y_cells; i++) {
		for (j = 0; j < x_cells; j++) {
			if (glass[i][j] === 1) {
				scope.Block(ctx_glass, j * dx, i * dy, dx, dy);
			}
		}
	}
}

// Метод очистки игровой области при начале новой игры.

scope.clearGame = function(glass) {

	var i;

	ctx_glass.clearRect(0, 0, width, height);
	ctx_fig.clearRect(0, 0, width, height);

	for (i = 0; i < y_cells; i++) {
		glass[i] = glass[i].map(function() {return 0;});
	}
}
}