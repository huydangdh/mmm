import callProcessDeviceData from "@src/services/DbService";
import Device, { DeviceStatus } from "./Device";
import { deviceMockConfigs } from "@src/configs/Configs";

class SCADA {
  private deviceList: Device[] = [];

  // Khởi tạo 10 devices từ cấu hình mock
  initializeDevices(): void {
    const deviceConfigs = deviceMockConfigs; // Hàm này trả về một mảng các cấu hình mock

    deviceConfigs.forEach((config, index) => {
      const device = new Device(index + 1, config.name, config.ip, config.port);
      this.addDevice(device);
    });
  }

  addDevice(device: Device): void {
    this.deviceList.push(device);
    // Lắng nghe sự kiện từ Device và gọi các hàm xử lý tương ứng
    device.on(DeviceStatus.Connected, (eventData) => {
      this.handleDeviceConnected(eventData, eventData);
    });
    device.on(DeviceStatus.Receiving, (eventData) => {
      this.handleDataFromDevice(eventData.deviceID, eventData.data);
    });

    device.on(DeviceStatus.Disconnected, (error) => {
      this.handleDeviceClose(device.deviceName, error);
    });

    device.on(DeviceStatus.Error, (error) => {
      this.handleDeviceError(device.deviceName, error);
    });
  }
  handleDeviceConnected(deviceName: any, data: any) {
    console.log(
      `${new Date()
        .toISOString()}=TCL: handleDeviceConnected -> ${deviceName},${data}`
    );
  }
  handleDeviceError(deviceName: string, error: any) {
    console.log(
      `${new Date().toISOString()}=TCL: handleDeviceError -> ${deviceName},${error}`
    );
  }
  handleDeviceClose(deviceName: string, error: any) {
    console.log(
      `${new Date().toISOString()}=TCL: handleDeviceClose -> ${deviceName},${error}`
    );
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

  private async handleDataFromDevice(deviceID: number, data: string) {
    // Process and handle data from the device
    callProcessDeviceData(deviceID, data).then((res) => {
      this.deviceList.at(deviceID)?.deviceSocket.write(`DB:${res}`);
      console.log(`${new Date().toISOString()}=DB_res_${deviceID}: ${res}`);
    });

    console.log(
      `${new Date().toISOString()}=Data received from ${deviceID}: ${data}`
    );
  }

  // Add other methods for handling and processing data from devices
}

export default SCADA;
