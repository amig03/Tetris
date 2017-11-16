Math.randInt = function (max) {
	return Math.floor(Math.random() * max);
};

function isOne (num) {
	return num === 1;
}

// Функция проверки заполненности строк

function checkFilledRows (ctx_glass, glass, y_cells) {
	var i, j;

	var delete_rows = [];

	for (i = 0; i < y_cells; i++) {
		if (glass[i].every(isOne)) {
			delete_rows.push(i);
		}
	}

	if (delete_rows.length == 0) return false;
	return delete_rows;
}