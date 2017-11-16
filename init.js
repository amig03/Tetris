// Запуск функции инициализации при загрузке страницы.

window.onload = function() {
	init(options);
}

function init(options) {

// Присвоение значений по-умолчанию, если в options они не заданы
	
	var options = (options === undefined) ? {} : options;

	options.X_CELLS = options.X_CELLS || 10;
	options.Y_CELLS = options.Y_CELLS || 20;
	options.CELL_WIDTH = options.CELL_WIDTH || 40;
	options.CELL_HEIGHT = options.CELL_HEIGHT || 40;
	options.figures = options.figures || ["1,1,1,1", "1,0,0;1,1,1", "0,0,1;1,1,1", "1,1;1,1", "0,1,1;1,1,0", "1,1,0;0,1,1", "0,1,0;1,1,1"];
	options.containerID = options.containerID;
	options.container = (options.containerID === undefined) ? document.body : document.getElementById(options.containerID);
	options.fall_delta = options.fall_delta || 500;
	// options.side_control_delay = options.side_control_delay || 50;
	options.rotate_delay = options.rotate_delay || 500;
	options.drop_delay = options.drop_delay || 200;
	options.blink_amount = options.blink_amount || 3;
	options.one_blink_time = options.one_blink_time || 200;
	options.blink_boost = options.blink_boost || 1;
	options.level_boost_fall_delta = options.level_boost_fall_delta || 1.05;

	var render = options.renderer = new Render(options);

// Создание DOM элементов, установка их размеров и рисование сетки

	render.createDOM();
	render.setSizes();
	render.Grid();
	render.Sound();

// Создание объектов фигур

	make_figures(options);

// Инициализация тетриса

	var tetris = new Tetris(options);
	
}