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
