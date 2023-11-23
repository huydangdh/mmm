import callProcessDeviceData from "@src/services/DbService";
import Device, { DeviceStatus } from "./Device";
import { deviceMockConfigs } from "@src/configs/Configs";
import { Server, Socket } from "socket.io";

enum ClientEmitMessage {
  GETSTATUSDEVICES = "GetStatusDevices",
  RECVSTATUSDEVICES = "RECVSTATUSDEVICES",
}

class SCADA {
  private deviceList: Device[] = [];
  private socketIO!: Server;

  // Create initializeSocketIO dont have args init with port 8888
  InitializeSCADA(port?: number) {
    this.socketIO = new Server().listen(8888, {
      cors: {
        origin: "*",
      },
    });
    this.socketIO.on("connection", (socket: Socket) => {
      console.log("TCL: publicInitializeSCADA -> socket[id]=", socket.id);

      socket.on(ClientEmitMessage.GETSTATUSDEVICES, (data:any) => {
        console.log("TCL: GETSTATUSDEVICES -> socket[id]=", socket.id);
        socket.emit(
          ClientEmitMessage.RECVSTATUSDEVICES,
          JSON.stringify(this.deviceList)
        );
      });
    });
  }

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
      `${new Date().toISOString()}=TCL: handleDeviceConnected -> ${deviceName},${data}`
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

  // get all feild( expect Socket) devices

  private async handleDataFromDevice(deviceID: number, data: string) {
    // Process and handle data from the device
    try {
      callProcessDeviceData(deviceID, data).then((res) => {
        this.deviceList.at(deviceID - 1)?.sendToDevice(`${data}|${res}`);
        console.log(`${new Date().toISOString()}=DB_res_${deviceID}: ${res}`);
      });
    } catch (error) {
      this.deviceList
        .at(deviceID - 1)
        ?.sendToDevice(`${data}|${error} \n`);
    }
    console.log(
      `${new Date().toISOString()}=Data received from ${deviceID}: ${data}`
    );
  }

  // Add other methods for handling and processing data from devices
}

export default SCADA;
