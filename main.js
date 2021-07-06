'use strict';



function EncoderHardware() {
	var self = this;
	var isInited = false;
	var lastEncoderValue = 0;
	var diff = 0;

	self.update = function(value) {
		if (!isInited) {
			diff = 0;
			isInited = true;
		} else {
			if (value > lastEncoderValue) {
				var currentDiff = value - lastEncoderValue;
				if (currentDiff > 512) { // overflow
					diff = currentDiff - 1024; 
				} else {
					diff = currentDiff;
				}
			} else {
				var currentDiff = lastEncoderValue - value;
				if (currentDiff > 512) {
					// diff = -(value + 1024 - lastEncoderValue);
					diff = 1024 - currentDiff;
				} else {
					diff = -currentDiff;
				}
			}
		}
		lastEncoderValue = value;
		diff *= (24.0 * 3.1415926535897932384626433832795 / 1024.0);
	};

	self.getResult = function() {
		return diff;
	};
};


function Odometry() {
	var self = this;
	
	function calculate(left, right) {
		var reversed = false;
		if (left < 0) {
			left = -left;
			right = -right;
			reversed = true;
		}



	}

	self.update = function(leftSpeed, rightSpeed) {
		if (leftSpeed == rightSpeed) {
			return {
				"forward": leftSpeed,
				"slip": 0.0,
				"turn": 0.0
			};
		} else {
			return calculate(leftSpeed, rightSpeed);
		}
	};

	self.getResult = function() {

	};
	
};

function Coment() {
	var self = this;
	var leftEncoder = new EncoderHardware();
	var rightEncoder = new EncoderHardware();


	// for debug
	var debug_left = 0;
	var debug_left45 = 0;
	var debug_front = 0;
	var debug_right45 = 0;
	var debug_right = 0;
	var debug_encoder_left = 0;
	var debug_encoder_right = 0;

	self.update = function(left, left45, front, right45, right, encoder_left, encoder_right) {
		debug_left = left;
		debug_left45 = left45;
		debug_front = front;
		debug_right45 = right45;
		debug_right = right;
		debug_encoder_left = encoder_left;
		debug_encoder_right = encoder_right;

		leftEncoder.update(encoder_left);
		rightEncoder.update(encoder_right);

		var leftSpeed = leftEncoder.getResult();
		var rightSpeed = rightEncoder.getResult();


	};


	self.readResult = function() {
		return {
			"leftSpeed": 20,
			"rightSpeed": 20,
			"log": [
				// { name: 'Left',    value: left,    min: 0, max: 35 },
				// { name: 'Front',   value: front,   min: 0, max: 35 },
				// { name: 'Right',   value: right,   min: 0, max: 35 },
				{ "name": 'Encoder Left',  "value": debug_encoder_left,   min: 0, max: 1024 },
				// { name: 'Encoder Right', value: encoder_right,  min: 0, max: 1024 },
				{"name": "diff", "value": leftEncoder.getResult(), "min": -50, "max": 80}
			]
		};
	};
}

var coment = new Coment();

function control(left, left45, front, right45, right, encoder_left, encoder_right) {
    coment.update(left, left45, front, right45, right, encoder_left, encoder_right);
		let ret = coment.readResult();
		return ret;
}

/////////////////////// CONSTRUCTION SITE /////////////////
function MovingDiffData(longitude, lateral, orientation) {
	var self = this;
	self.longitude = longitude;
	self.lateral = lateral; 
	self.orientation = orientation;
};

var EPSILON = 1e-3;
var PI = 3.1415926535897932384626433832795;
function floatEqual(a, b) {
	var diff = a - b;
	return (diff < EPSILON) && (diff > -EPSILON); 
}
function longitudeMirror(movingDiffData) {
	return new MovingDiffData(-movingDiffData.longitude, movingDiffData.lateral, -movingDiffData.orientation); 
}

function lateralMirror(movingDiffData) {
	return new MovingDiffData(movingDiffData.longitude, -movingDiffData.lateral, -movingDiffData.orientation);
}

var MOUSE_WIDTH = 10.0 / 2.0 + 55.0 + 10.0 / 2.0;


function calculateMovingDiff(left, right) {
	if (floatEqual(left, right)) {
		return new MovingDiffData(left, 0, 0);
	}
	if (floatEqual(left, 0.0)) {	// right must not be 0.0
		if (floatEqual(right, 0.0)) return new MovingDiffData(0.0, 0.0, 0.0);
		if (right < 0.0) return longitudeMirror(calculateMovingDiff(-left, -right));

		var wholeCircle = PI * MOUSE_WIDTH * 2.0;
		console.log("whole circle = ", wholeCircle);
		while (right > wholeCircle) right -= wholeCircle;
		var ori = right * 2.0 * PI / wholeCircle;
		if (ori > PI) ori -= 2*PI;
		return new MovingDiffData(Math.sin(ori) * MOUSE_WIDTH / 2.0, 
															(1.0 - Math.cos(ori)) * MOUSE_WIDTH / 2.0,
															ori);
	}
	if (floatEqual(right, 0.0)) return lateralMirror(calculateMovingDiff(right, left));
	if (left > 0 && right > 0) {
		if (left < right) { // turn left
			var xOffset = (MOUSE_WIDTH * left) / (right / left);
			var radius = xOffset + MOUSE_WIDTH;
			var wholeCircle = PI * radius * 2.0;
			while (right > wholeCircle) right -= wholeCircle;
			var ori = right * 2.0 * PI / wholeCircle;
			return new MovingDiffData(Math.sin(ori) * (xOffset + MOUSE_WIDTH / 2.0),
																(1.0 - Math.cos(ori)) * (xOffset + MOUSE_WIDTH / 2.0),
																ori);
			

		}
	}
}

function main() {
	// var moving = calculateMovingDiff();
	console.log(calculateMovingDiff(0, 0));
	console.log(calculateMovingDiff(0, 50));
	console.log(calculateMovingDiff(0, 100));
	console.log(calculateMovingDiff(0, 150));
	console.log(calculateMovingDiff(0, 300));
	console.log(calculateMovingDiff(0, 400));
	console.log(calculateMovingDiff(0, 500));
	console.log(calculateMovingDiff(0, 5000));
	console.log(calculateMovingDiff(0, 5));
	console.log(calculateMovingDiff(0, -5));
	console.log(calculateMovingDiff(0, 102));
	console.log(calculateMovingDiff(0, 204));
	console.log(calculateMovingDiff(204, 0));
	
}

main();
