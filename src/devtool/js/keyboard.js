/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEVICE, KEYBOARD_CONTROL_MAPPING, OBJECT_NAME } from './constants';

import { EmulatorSettings } from './emulatorStates';
import { JOYSTICKS } from './controllers';
import { relayKeyboardEvent } from './messenger';

document.addEventListener(
	'keydown',
	(event) => {
		const result = getReservedKeyAction(event.key);
		if (EmulatorSettings.instance.actionMappingOn && result) {
			const [handKey, action] = result;
			onReservedKeyDown(handKey, action);
			moveJoysticks();
		} else {
			passThroughKeyboardEvent(event);
		}
	},
	false,
);

document.addEventListener(
	'keyup',
	(event) => {
		const result = getReservedKeyAction(event.key);
		if (result) {
			const [handKey, action] = result;
			onReservedKeyUp(handKey, action);
			moveJoysticks();
		} else if (EmulatorSettings.instance.actionMappingOn) {
			passThroughKeyboardEvent(event);
		}
	},
	false,
);

document.addEventListener(
	'keypress',
	(event) => {
		const result = getReservedKeyAction(event.key);
		if (!result && EmulatorSettings.instance.actionMappingOn) {
			passThroughKeyboardEvent(event);
		}
	},
	false,
);

const emulatedJoysticks = {};

const resetEmulatedJoysticks = () => {
	emulatedJoysticks.left = {
		left: false,
		right: false,
		forward: false,
		backward: false,
	};
	emulatedJoysticks.right = {
		left: false,
		right: false,
		forward: false,
		backward: false,
	};
};

resetEmulatedJoysticks();

const getReservedKeyAction = (key) => {
	let result = null;
	Object.entries(KEYBOARD_CONTROL_MAPPING).forEach(([handKey, mapping]) => {
		Object.entries(mapping).forEach(([action, mappedKey]) => {
			if (mappedKey == key) {
				result = [handKey, action];
			}
		});
	});
	return result;
};

const onReservedKeyDown = (handKey, action) => {
	const rangeInput = document.getElementById(
		handKey + '-controller-' + action + '-value',
	);
	const pressButton = document.getElementById(
		handKey + '-controller-' + action + '-press',
	);
	switch (action) {
		case 'joystickLeft':
			emulatedJoysticks[handKey].left = true;
			break;
		case 'joystickRight':
			emulatedJoysticks[handKey].right = true;
			break;
		case 'joystickForward':
			emulatedJoysticks[handKey].forward = true;
			break;
		case 'joystickBackward':
			emulatedJoysticks[handKey].backward = true;
			break;
		case 'trigger':
		case 'grip':
			rangeInput.value = 100;
			document.getElementById(
				handKey + '-controller-' + action + '-press',
			).disabled = true;
			rangeInput.oninput();
			break;
		default:
			pressButton.click();
	}
};

const onReservedKeyUp = (handKey, action) => {
	const rangeInput = document.getElementById(
		handKey + '-controller-' + action + '-value',
	);
	const pressButton = document.getElementById(
		handKey + '-controller-' + action + '-press',
	);
	switch (action) {
		case 'joystickLeft':
			emulatedJoysticks[handKey].left = false;
			break;
		case 'joystickRight':
			emulatedJoysticks[handKey].right = false;
			break;
		case 'joystickForward':
			emulatedJoysticks[handKey].forward = false;
			break;
		case 'joystickBackward':
			emulatedJoysticks[handKey].backward = false;
			break;
		case 'trigger':
		case 'grip':
			rangeInput.value = 0;
			document.getElementById(
				handKey + '-controller-' + action + '-press',
			).disabled = false;
			rangeInput.oninput();
			break;
		default:
			pressButton.click();
	}
};

/**
 *
 * @param {KeyboardEvent} event
 */
const passThroughKeyboardEvent = (event) => {
	const options = {
		key: event.key,
		code: event.code,
		location: event.location,
		repeat: event.repeat,
		isComposing: event.isComposing,
		ctrlKey: event.ctrlKey,
		shiftKey: event.shiftKey,
		altKey: event.altKey,
		metaKey: event.metaKey,
	};

	relayKeyboardEvent(event.type, options);
};

const moveJoysticks = () => {
	Object.entries(emulatedJoysticks).forEach(([handKey, directions]) => {
		const deviceId =
			handKey == 'left' ? DEVICE.LEFT_CONTROLLER : DEVICE.RIGHT_CONTROLLER;
		const deviceName = OBJECT_NAME[deviceId];
		if (
			directions.left ||
			directions.right ||
			directions.forward ||
			directions.backward
		) {
			let axisX = directions.left ? -1 : 0 + directions.right ? 1 : 0;
			let axisY = directions.forward ? -1 : 0 + directions.backward ? 1 : 0;
			const normalizeScale = Math.sqrt(axisX * axisX + axisY * axisY);

			if (JOYSTICKS[deviceName]) {
				JOYSTICKS[deviceName].overrideMove(
					axisX / normalizeScale,
					axisY / normalizeScale,
				);
			}
		} else {
			if (JOYSTICKS[deviceName]) {
				JOYSTICKS[deviceName].overrideMove(0, 0);
			}
		}
	});
};

export const setupKeyboardControlButtons = () => {
	document.getElementById('action-mapping').onclick = function () {
		EmulatorSettings.instance.actionMappingOn =
			!EmulatorSettings.instance.actionMappingOn;
		this.classList.toggle(
			'button-pressed',
			EmulatorSettings.instance.actionMappingOn,
		);
		EmulatorSettings.instance.write();
	};
	document
		.getElementById('action-mapping')
		.classList.toggle(
			'button-pressed',
			EmulatorSettings.instance.actionMappingOn,
		);
	// FIXME: This alert doesn't seem to work in Firefox
	document.getElementById('keyboard-mapping').onclick = function () {
		alert(`
      Left Controller Mapping:
      Joystick: WASD
      Trigger: E
      Grip: Q
      ButtonX: X
      ButtonY: Z
      ---------------------------
      Right Controller Mapping:
      Joystick: Arrow keys
      Trigger: Enter
      Grip: Shift
      ButtonA: '
      ButtonB: /
      `);
	};
	// document.getElementById('keyboard-settings').onclick = function () {
	// 	alert('Keyboard control settings not yet available');
	// };
	window.addEventListener('blur', resetEmulatedJoysticks);
};
