function Blinking (params) {

/*
Этот объект отвечает за состояния
*/

	scope = this;

// Назначение локальных переменных

	var ctx = params.ctx_glass;
	var width = params.width;
	var dy = params.dy;

	var i, j;
	var boosting;
	var boost_multiply;
	var rows, boost, timer, amount;
	var timeouts = [];
	var draw_timer = 0;
	var clear_timer = 0;

// Создание события завершения мигания для взаимодействия с другими объектами
// Установка слушателя мгновенного завершения мигания и последующих процессов. Нужен для постановки игры на паузу или завершения игры во время миганий.

	var event_finishBlink = new Event("finishBlink");
	document.addEventListener("fast_stop_blink", fast_stop_blink);

// метод очистки строки

	function clearing() {
		for (i = 0; i < rows.length; i++) {
			ctx.clearRect(0, rows[i] * dy, width, dy);
		}
	}

// метод отрисовки строки

	function drawing() {
		for (i = 0; i < rows.length; i++) {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, rows[i] * dy, width, dy);
		}
	}

// метод завершения миганий. отсылает событие завершения миганий.

	function finishBlink() {
		document.dispatchEvent(event_finishBlink);
	}

// метод мгновенной остановки миганий

	function fast_stop_blink() {
		for (i = 0; i < timeouts.length; i++) {
			clearTimeout(timeouts[i]);
		}
	}

// непосредственно метод миганий. Устанавливает таймауты отрисовки и очистки строк. Учитывается множитель ускорений.

	function blink (times) {

		boosting = 1;
		boost_multiply = 0;
		clear_timer = 0;

		for (i = 0; i <= times; i++) {
			
			timeouts.push(setTimeout(clearing, clear_timer));

			draw_timer = clear_timer + timer * boosting;
			clear_timer = draw_timer + timer * boosting;

			if (i !== times) {
				timeouts.push(setTimeout(drawing, draw_timer));
			}	

			boost_multiply = (boost == 1) ? 1 : boost_multiply + 1;
			boosting = 1/(boost * boost_multiply);
		}
	}

// Публичный метод инициализации миганий.
// Назначает переменные, необходимые для миганий.
// Устанавливает таймер, по окончании которого отошлется событие окончания миганий.

	scope.startBlink = function(getted_rows, getted_amount, getted_timer, getted_boost) {
		rows = getted_rows;
		boost = getted_boost;
		timer = getted_timer;
		amount = getted_amount;
		
		clear_timer = 0;
		draw_timer = 0;

		var common_blink_time = timer * 2;

		for (i = 1; i < amount; i++) {
			j = (boost == 1) ? 1 : i;
			common_blink_time += timer * 2 / (boost * j);
		}

// + 5 мс - небольшой запас, учитывающий погрешность, чтобы мигания не завершились раньше продолжения игры.

		common_blink_time += timer / (boost * j) + 5;

		timeouts.push(setTimeout(finishBlink, common_blink_time));
		blink(amount);
	}
	
}