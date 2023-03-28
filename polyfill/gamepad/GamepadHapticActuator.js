export const PRIVATE = Symbol('@@webxr-polyfill/GamepadHapticActuator');

// https://w3c.github.io/gamepad/extensions.html#dom-gamepadhapticactuatortype
export const GamepadHapticActuatorType = {
    VIBRATION: "vibration",
    DUAL_RUMBLE: "dual-rumble"
};

// https://w3c.github.io/gamepad/extensions.html#gamepadhapticactuator-interface
export class GamepadHapticActuator {
	constructor(type) {
		this[PRIVATE] = {
			type,
            // Implementation
            value: 0,
            until: 0,
            pendingPulse: null
		};
	}

    _update() {
        // Handle any changes to the vibration value
        let valueChanged = false;
        if(this[PRIVATE].nextValue) {
            this[PRIVATE].value = this[PRIVATE].nextValue;
            valueChanged = true;
            this[PRIVATE].nextValue = null;
        }

        // Check if the pulse has completed
        const until = this[PRIVATE].until;
        if(until && Date.now() >= until) {
            this[PRIVATE].value = 0;
            this[PRIVATE].until = null;
            valueChanged = true;

            if(this[PRIVATE].pendingPulse) {
                this[PRIVATE].pendingPulse.resolve(true);
                this[PRIVATE].pendingPulse = null;
            }
        }

        // Notify the caller if the value has changed
        return valueChanged;
    }

    get _value() {
        return this[PRIVATE].value;
    }

    pulse(value, duration) {
        if(this[PRIVATE].pendingPulse) {
            // FIXME: Is this the correct behaviour, or should the promise be extended
            //        until any vibration is completed?
            this[PRIVATE].pendingPulse.resolve(true);
            this[PRIVATE].pendingPulse = null;
        }

        return new Promise((resolve, reject) => {
            // Delay updating the value till _update()
            this[PRIVATE].nextValue = value;
            this[PRIVATE].until = Date.now() + duration;
            // Note: Oculus browser seems to directly resolve the Promise with "preempted"
            //       Likely their implementation of pulse() follows the spec for playEffect()
            //this[PRIVATE].pendingPulse = { value, duration, resolve, reject };
            resolve("preempted");
        });
    }

}