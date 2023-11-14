import callProcessDeviceData from "@src/services/DbService";
import Device from "./Device";

class SCADA {
  private deviceList: Device[] = [];

  // Khởi tạo 10 devices từ cấu hình mock
  initializeDevices(): void {
    const deviceConfigs = this.getDeviceMockConfigs(); // Hàm này trả về một mảng các cấu hình mock

    deviceConfigs.forEach((config, index) => {
      const device = new Device(index + 1, config.name, config.ip, config.port);
      this.addDevice(device);
    });
  }

  // Hàm này trả về một mảng cấu hình mock (để thay thế cho dữ liệu thực từ cơ sở dữ liệu)
  private getDeviceMockConfigs(): {
    name: string;
    ip: string;
    port: number;
  }[] {
    // Mock data - Bạn có thể thay thế bằng dữ liệu thực từ cơ sở dữ liệu
    return [
      { name: "Device1", ip: "127.0.0.1", port: 55960 },
      { name: "Device2", ip: "127.0.0.1", port: 55961 },
      { name: "Device3", ip: "127.0.0.1", port: 55962 },
      { name: "Device4", ip: "127.0.0.1", port: 55963 },
      { name: "Device5", ip: "127.0.0.1", port: 55964 },
      { name: "Device6", ip: "127.0.0.1", port: 55965 },
      { name: "Device7", ip: "127.0.0.1", port: 55966 },
      { name: "Device8", ip: "127.0.0.1", port: 55967 },
      { name: "Device9", ip: "127.0.0.1", port: 55968 },
      { name: "Device10", ip: "127.0.0.1", port: 55969 },

      // ... Thêm các cấu hình khác tương ứng
    ];
  }

  addDevice(device: Device): void {
    this.deviceList.push(device);
    // Lắng nghe sự kiện từ Device và gọi các hàm xử lý tương ứng
    device.on("connected", (eventData) => {
      this.handleDeviceConnected(eventData, eventData);
    });
    device.on("dataReceived", (eventData) => {
      this.handleDataFromDevice(eventData.deviceID, eventData.data);
    });

    device.on("devClose", (error) => {
      this.handleDeviceClose(device.deviceName, error);
    });

    device.on("devError", (error) => {
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
