/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_TRANSFORMS } from './constants';

// eslint-disable-next-line no-undef
const localStorage = chrome.storage.local;
const STORAGE_KEY = 'immersive-web-emulator-settings';

export const emulatorStates = {
	inImmersive: false,
	actionMappingOn: true,
	assetNodes: {},
	hapticActuatorStates: {
		'left-controller': 0,
		'right-controller': 0,
	},
	controllers: {
		'left-controller': {
			joystick: {
				touched: false,
				pressed: false,
				valueX: 0,
				valueY: 0,
			},
			trigger: {
				touched: false,
				value: 0,
			},
			grip: {
				touched: false,
				value: 0,
			},
			button1: {
				touched: false,
				pressed: false,
			},
			button2: {
				touched: false,
				pressed: false,
			},
		},
		'right-controller': {
			joystick: {
				touched: false,
				pressed: false,
				valueX: 0,
				valueY: 0,
			},
			trigger: {
				touched: false,
				value: 0,
			},
			grip: {
				touched: false,
				value: 0,
			},
			button1: {
				touched: false,
				pressed: false,
			},
			button2: {
				touched: false,
				pressed: false,
			},
		},
	},
	playbackInProgress: false,
};

export class EmulatorSettings {
	static get instance() {
		if (!EmulatorSettings._instance) {
			EmulatorSettings._instance = new EmulatorSettings();
		}
		return EmulatorSettings._instance;
	}

	constructor() {
		this.stereoOn = false;
		this.actionMappingOn = true;
		this.defaultPose = DEFAULT_TRANSFORMS;
		this.deviceKey = 'Meta Quest Pro';
		this.keyboardMappingOn = true;
		this.roomDimension = { x: 6, y: 3, z: 6 };
	}

	load() {
		return new Promise((resolve) => {
			localStorage.get(STORAGE_KEY, (result) => {
				const settings = result[STORAGE_KEY]
					? JSON.parse(result[STORAGE_KEY])
					: null;
				this.stereoOn = settings?.stereoOn ?? false;
				this.actionMappingOn = settings?.actionMappingOn ?? true;
				this.defaultPose = settings?.defaultPose ?? DEFAULT_TRANSFORMS;
				this.deviceKey = settings?.deviceKey ?? 'Meta Quest Pro';
				this.keyboardMappingOn = settings?.keyboardMappingOn ?? true;
				this.roomDimension = settings?.roomDimension ?? { x: 6, y: 3, z: 6 };
				resolve(result);
			});
		});
	}

	write() {
		const settings = {};
		settings[STORAGE_KEY] = JSON.stringify({
			stereoOn: this.stereoOn,
			actionMappingOn: this.actionMappingOn,
			defaultPose: this.defaultPose,
			deviceKey: this.deviceKey,
			keyboardMappingOn: this.keyboardMappingOn,
			roomDimension: this.roomDimension,
		});
		return new Promise((resolve) => {
			localStorage.set(settings, () => {
				resolve(settings);
			});
		});
	}
}
