function Control (options) {

/*
Этот объект отвечает за управление
*/

	ctrl = this;

// Получение игровой области. На ней создаются события.

	var game_area = options.game_area;

// Создание событий управления

	var event_left = new Event("left");
	var event_right = new Event("right");
	var event_up = new Event("up");
	var event_down = new Event("down");
	var event_space = new Event("space");
	var event_release = new Event("release");

// Этот объект определяет задержку в нажатиях клавиш.
// Предотвращает быстрое вращение фигуры при залипании кнопки поворота, а также мгновенное сбрасывание фигур при залипании кнопки сброса.
// В свойствах объекта содержится массив.
// Его первый элемент - время задержки.
// Второй - флаг разрешения действия. True - действие разрешено. False - запрещено.

	var timers_states = {
		// left: [options.side_control_delay, true],
		// right: [options.side_control_delay, true],
		up: [options.rotate_delay, true],
		space: [options.drop_delay, true]
	}

	var pressed_down = false;

// Начальные состояния переменных для сенсоров.

	var touch_x0 = 0;
	var touch_y0 = 0;
	var touch_x = 0;
	var touch_y = 0;
	var touch_startX = 0;
	var touch_startY = 0;

// Начало тача.

	function touchStart (e) {
		touch_x0 = e.changedTouches[0].pageX;
		touch_y0 = e.changedTouches[0].pageY;
		touch_startX = e.changedTouches[0].pageX;
		touch_startY = e.changedTouches[0].pageY;
	}

// Завершение тача. Сброс управления. Также отвечает за сброс фигуры вниз.

	function touchEnd (e) {
		touch_x = e.changedTouches[0].pageX;
		touch_y = e.changedTouches[0].pageY;

		var elem = document.elementFromPoint(touch_x, touch_y);

		if (elem.className == "tetris_buttons" || elem.id == "sound_symbol") return;

		dif_x = touch_x - touch_startX;
		dif_y = touch_y - touch_startY;

		if (abs_compare(dif_x, dif_y) === 0) {
			game_area.dispatchEvent(event_space);
		}
		ctrl.resetControl();
	}

// Метод реагирует на движение тача.

	function touchMove(e) {
		touch_x = e.changedTouches[0].pageX;
		touch_y = e.changedTouches[0].pageY;
		Swiped(e);
	}

// Метод определяет управляющее событие при свайпах.

	function Swiped (e) {
		var dif_x = touch_x - touch_x0;
		var dif_y = touch_y - touch_y0;

		if ((dif_x < 0) && abs_compare(dif_x, dif_y) && Math.abs(dif_x) > 40) {
			game_area.dispatchEvent(event_left);
			touch_x0 = e.changedTouches[0].pageX;
			touch_y0 = e.changedTouches[0].pageY;
		} else if ((dif_x > 0) && abs_compare(dif_x, dif_y) && Math.abs(dif_x) > 40) {
			game_area.dispatchEvent(event_right);
			touch_x0 = e.changedTouches[0].pageX;
			touch_y0 = e.changedTouches[0].pageY;
		} else if ((dif_y < 0) && abs_compare(dif_y, dif_x)) {
			if (setTimer("up")) game_area.dispatchEvent(event_up);
		} else if ((dif_y > 0) && abs_compare(dif_y, dif_x)) {
			game_area.dispatchEvent(event_down);
		} else if (abs_compare(dif_x, dif_y) === 0) {
			if (setTimer("space")) game_area.dispatchEvent(event_space);
		}
	}

// Сравнение по модулю двух величин.

	function abs_compare(a, b) {
		if (Math.abs(a) > Math.abs(b)) {
			return true;
		} else if (a === 0 && b === 0) {
			return 0;
		} else {
			return false;
		}
	}

// Метод генерирует разрешение или запрет создания управляющего события. Отвечает за задержку управления.

	function setTimer (pressed) {
		if (pressed in timers_states) {
			if (!timers_states[pressed][1]) return false;
			timers_states[pressed][1] = false;
			setTimeout(function() {timers_states[pressed][1] = true}, timers_states[pressed][0]);
		}

		if (pressed === undefined) {
			return false;
		} else return pressed;
	}

// Метод срабатывает при нажатии клавиши клавиатуры.

	function onKeyDown(e) {
		switch (e.keyCode) {
			case 37:
				// pressed_key = "left";
				game_area.dispatchEvent(event_left);
				break;
			case 38:
				// pressed_key = "up";
				if (setTimer("up")) game_area.dispatchEvent(event_up);
				break;
			case 39:
				// pressed_key = "right";
				game_area.dispatchEvent(event_right);
				break;
			case 40:
				pressed_down = true;
				break;
			case 32:
				if (setTimer("space")) game_area.dispatchEvent(event_space);
				break;
		}
	}

// Метод при отпускании клавиши. Отправляет событие снятия управления.

	function onKeyUp(e) {
		// pressed_key = "";
		ctrl.resetControl();
	}

// Публичный метод для снятия управления. Нужен для State Machine.

	ctrl.resetControl = function() {
		// pressed_key = "";
		game_area.dispatchEvent(event_release);
		pressed_down = false;
	}

	ctrl.getControl = function() {
		if (pressed_down) return "down";
	}

// Публичный метод установки слушателей тачей и клавиш.

	ctrl.Activate = function () {
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);

		document.addEventListener('touchstart', touchStart);
		document.addEventListener('touchmove', touchMove);
		document.addEventListener('touchend', touchEnd);
	}

// Публичный метод снятия слушателей тачей и клавиш.

	ctrl.Deactivate = function () {
		document.removeEventListener('keydown', onKeyDown);
		document.removeEventListener('keyup', onKeyUp);

		document.removeEventListener('touchstart', touchStart);
		document.removeEventListener('touchmove', touchMove);
		document.removeEventListener('touchend', touchEnd);
	}
}