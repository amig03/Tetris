function Figure (options, params, fsm, blink) {

/*
Объект управления фигурами
*/

	var fig = this;

// Назначение локальных переменных

	var cur_fig = params.current_figure;
	var glass = params.glass;
	var width = params.width;
	var height = params.height;
	var dx = params.dx;
	var dy = params.dy;
	var render = params.render;
	var ctx_fig = params.ctx_fig;
	var ctx_glass = params.ctx_glass;
	var blink_amount = options.blink_amount;
	var one_blink_time = options.one_blink_time;
	var blink_boost = options.blink_boost;
	var iface = params.iface;
	var game_area = options.game_area;

	var x_cells = width / dx;
	var y_cells = height / dy;

	var delete_rows;

// Определение события добавления очков

	var event_add_scores = new Event("add_scores");

// Установка слушателей завершения миганий

	document.addEventListener("finishBlink", finishBlink);
	document.addEventListener("fast_stop_blink", fast_stop_blink);

// Генерирует новую фигуру

	fig.Next = function () {
		var random_index = Math.randInt(figures.length);
		var random_phase = Math.randInt(4);

		cur_fig.center[0] = figures.centers[random_index][random_phase][0];
		cur_fig.center[1] = figures.centers[random_index][random_phase][1];
		cur_fig.matrix = figures[random_index][random_phase];
		cur_fig.phase = random_phase;
		cur_fig.index = random_index;
		cur_fig.position[0] = (Math.floor(x_cells / 2) - cur_fig.center[0] - 1) * dx;
		cur_fig.position[1] = 0;

		if (fig.Move()) {
			render.Figure(ctx_fig, cur_fig.position[0], cur_fig.position[1], cur_fig.matrix);
		} else {
			fsm.setState("gameover");
		}
	}

// Двигает фигуру и возвращает true.
// Возвращает false, если движение запрещено.
// Если есть аргумент justCheck - только проверяет, разрешено ли движение фигуры, но не двигает ее.

	fig.Move = function (action, justCheck) {
		var i, j;
		var next_phase;
		var next_matrix;
		
		var next_x = cur_fig.position[0];
		var next_y = cur_fig.position[1];

		var next_center_x_cell = cur_fig.center[0];
		var next_center_y_cell = cur_fig.center[1];

		var delta_x = 0;
		var delta_y = 0;

		var center_delta_x_cell = 0;
		var center_delta_y_cell = 0;

		switch (action) {
			case "left":
				delta_x = -dx;
				break;
			case "right":
				delta_x = dx;
				break;
			case "down":
				delta_y = dy;
				break;
			case "rotate":
				next_phase = (cur_fig.phase === 3) ? 0 : cur_fig.phase + 1;
				next_matrix = figures[cur_fig.index][next_phase];
				next_center_x_cell = figures.centers[cur_fig.index][next_phase][0];
				next_center_y_cell = figures.centers[cur_fig.index][next_phase][1];
				center_delta_x_cell = cur_fig.center[0] - next_center_x_cell;
				center_delta_y_cell = cur_fig.center[1] - next_center_y_cell;
				break;
		}
		next_phase = (next_phase === undefined) ? cur_fig.phase : next_phase;
		next_matrix = next_matrix || cur_fig.matrix;

		next_x += delta_x + center_delta_x_cell * dx;
		next_y += delta_y + center_delta_y_cell * dy;

		var next_x_cell = next_x/dx;
		var next_y_cell = next_y/dy;
		var x_length = next_matrix[0].length;
		var y_length = next_matrix.length;

		for (i = next_y_cell; i < next_y_cell + y_length; i++) {
			for (j = next_x_cell; j < next_x_cell + x_length; j++) {
				try {
					var check = next_matrix[i - next_y_cell][j - next_x_cell] + glass[i][j];
					if (check === 2 || isNaN(check)) return false;
				} catch (e) {return false};
			}
		}

		if (justCheck !== undefined) return true;

		cur_fig.position[0] = next_x;
		cur_fig.position[1] = next_y;
		cur_fig.center[0] = next_center_x_cell;
		cur_fig.center[1] = next_center_y_cell;
		cur_fig.matrix = next_matrix;
		cur_fig.phase = next_phase;

		return true;
	}

// Метод сброса фигуры

	fig.Drop = function () {
		var i;
		var cur_y = cur_fig.position[1];

		for (i = cur_y/dy; i < y_cells; i++) {
			cur_y = i * dy;

			if (!fig.Move("down")) {
				fig.toGlass(cur_fig.position[0], cur_fig.position[1]);
				return;
			} 

		}
	}

// Метод, завершающий действие помещения в стакан после миганий

	function finishBlink() {
		fsm.setState("playing");
		render.updateGlass(glass, delete_rows);
		fig.Next();
	}

// Метод, быстро завершающий действие помещения в стакан при быстрой остановке миганий

	function fast_stop_blink() {
		render.updateGlass(glass, delete_rows);
		fig.Next();
	}

// Помещение фигуры в стакан

	fig.toGlass = function (x0, y0) {
		
		var func = fig.toGlass;

		var i, j;
		var x0_cell = x0 / dx;
		var y0_cell = y0 / dy;

		var x_length = cur_fig.matrix[0].length;
		var y_length = cur_fig.matrix.length;

// Рисуем блок в месте размещения фигуры

		render.Figure(ctx_glass, x0, y0, cur_fig.matrix);
		ctx_fig.clearRect(0, 0, width, height);
		for (i = y0_cell; i < y0_cell + y_length; i++) {
			for (j = x0_cell; j < x0_cell + x_length; j++) {
				if (cur_fig.matrix[i - y0_cell][j - x0_cell] === 1) {
					glass[i][j] = 1;
				}
			}
		}

// Заполняем массив с удаляемыми строками. Если строк нет - delete_rows получает false

		delete_rows = checkFilledRows(ctx_glass, glass, y_cells);

// Если массив не пуст, устанавливаем состояние миганий, вызываем мигания, в интерфейс передаем количество удаляемых строк для расчета очков.
// Кидаем событие расчета очков для интерфейса.

		if (delete_rows) {
			fsm.setState("blinking");
			blink.startBlink(delete_rows, blink_amount, one_blink_time, blink_boost);
			iface.rowsScores(delete_rows.length);
			game_area.dispatchEvent(event_add_scores);
			return;
		}

// Если массив пустой - создаем следующую фигуру.

		fig.Next();
	}

}