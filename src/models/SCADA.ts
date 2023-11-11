import Device from './Device';

class SCADA {
    private deviceList: Device[] = [];

    addDevice(device: Device): void {
        this.deviceList.push(device);
    }

    connectAllDevices(): void {
        this.deviceList.forEach((device) => {
            device.connectToDevice();
        });
    }

    // Add other methods for handling and processing data from devices

    // Example method to get data from all connected devices
    getDataFromAllDevices(): void {
        this.deviceList.forEach((device) => {
            // Call method to get data from each device
            // Modify as per your specific requirements
            console.log(`${device.deviceName} data: getDataFromDevice()`);
        });
    }
}

export default SCADA;
