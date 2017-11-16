var options = {
	X_CELLS: 10,
	Y_CELLS: 20,
	CELL_WIDTH: 40,
	CELL_HEIGHT: 40,
	figures: ["1", "1,1", "1,1,1", "1,1,1,1", "0,0,1;1,1,1", "1,0,0;1,1,1", "0,1,1;1,1,0", "1,1,0;0,1,1", "0,1,0;1,1,1", "1,1;1,1"],
	containerID: "tetris",
	fall_delta: 500,
	// side_control_delay: 200,
	rotate_delay: 500,
	drop_delay: 200,
	blink_amount: 2,
	one_blink_time: 300,
	blink_boost: 1,
	level_boost_fall_delta: 3
}