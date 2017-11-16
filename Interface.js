function Interface (options) {
	
/*
Объект управления интерфейсом
*/

// Назначение локальных переменных

	var iface = this;
	var hideMessageTimer;

	var back = options.message_back_plane;
	var parent_message = back.parentElement;
	var start_button = options.start_button;
	var pause_button = options.pause_button;
	var stop_button = options.stop_button;
	var scores_elem = options.scores;
	var level_elem = options.level;
	var x_cells = options.X_CELLS;
	var game_area = options.game_area;

	var scores = 0;
	var level = 0;
	var next_level = 100;
	var level_step = 100;
	var rows_scores = 1;

	var message = document.createElement('div');
	message.id = 'message';

// Создание событий поднятия уровня и сброса игры при Game Over

	var event_level_up = new Event("level_up");
	var event_reset_game = new Event("reset_game");

// Устанавливаем слушатель для расчета очков

	game_area.addEventListener("add_scores", addScores);

// Метод показа сообщения

	iface.showMessage = function (msg) {
		clearTimeout(hideMessageTimer);
		back.style.opacity = "0.5";
		parent_message.appendChild(message);
		message.innerHTML = msg;
		message.className = "appear";
	}

// Метод скрытия сообщения

	iface.hideMessage = function () {
		back.style.opacity = "0";
		message.className = "disappear";
		hideMessageTimer = setTimeout(function() {parent_message.removeChild(message);}, 500);
	}

// Метод, устанавливающий слушатели на элементы интерфейса - кнопки

	iface.setButtonControls = function(fsm) {
		start_button.addEventListener('click', function() {fsm.setState("playing")});
		pause_button.addEventListener('click', function() {fsm.setState("pause")});
		stop_button.addEventListener('click', function() {fsm.setState("gameover")});
	}

// Метод, сбрасывающий статистику при окончании игры

	iface.resetGame = function() {
		scores = 0;
		scores_elem.innerHTML = "Scores: " + scores;
		level = 0;
		level_elem.innerHTML = "Level: " + level;
		game_area.dispatchEvent(event_reset_game);
	}

// Получает извне количество удаляемых строк - множитель для очков

	iface.rowsScores = function(rows) {
		rows_scores = rows;
	}

// Начисляет очки

	function addScores() {
		scores += x_cells * rows_scores;
		scores_elem.innerHTML = "Scores: " + scores;

		if (scores >= next_level) {
			level++;
			level_elem.innerHTML = "Level: " + level;
			next_level += level_step;
			game_area.dispatchEvent(event_level_up);
		}
	}
}