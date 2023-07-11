import { DEVICE } from "./constants";
import { emulatorStates } from "./emulatorStates";

export class SockpuppetConnection {

    constructor() {
        this.websocket = new WebSocket('ws://localhost:3000/listen');
        this.websocket.addEventListener('open', (_) => {
            // Request state;
            this.websocket.send('state');
        });
        this.websocket.addEventListener('message', (ev) => {
            const data = JSON.parse(ev.data);
            // Update the emulator state
            if(emulatorStates.emulatedDevice) {
                // Left controller
                const leftController = emulatorStates.emulatedDevice.getDeviceNode(DEVICE.INPUT_LEFT);
                if(leftController) {
                    leftController.position.set(
                        data.leftController.position[0],
                        data.leftController.position[1],
                        data.leftController.position[2]);
                    leftController.quaternion.set(
                        data.leftController.quaternion[0],
                        data.leftController.quaternion[1],
                        data.leftController.quaternion[2],
                        data.leftController.quaternion[3]);
                }

                // Right controller
                const rightController = emulatorStates.emulatedDevice.getDeviceNode(DEVICE.INPUT_RIGHT);
                if(rightController) {
                    rightController.position.set(
                        data.rightController.position[0],
                        data.rightController.position[1],
                        data.rightController.position[2]);
                    rightController.quaternion.set(
                        data.rightController.quaternion[0],
                        data.rightController.quaternion[1],
                        data.rightController.quaternion[2],
                        data.rightController.quaternion[3]);
                }

                emulatorStates.emulatedDevice.forceEmitPose();
            }
        });
    }

}