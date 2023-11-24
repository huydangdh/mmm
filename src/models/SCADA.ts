import callProcessDeviceData from "@src/services/DbService";
import Device, {DeviceStatus} from "./Device";
import {deviceMockConfigs} from "@src/configs/Configs";
import {Server, Socket} from "socket.io";

enum ClientEmitMessage {
	GETSTATUSDEVICES = "GetStatusDevices",
	RECVSTATUSDEVICES = "RECVSTATUSDEVICES",
	UPDATESTATUSDEVICES = "UPDATESTATUSDEVICES",
	RECVDATA = "RECVDATA"
}

class SCADA {
	private deviceList: Device[] = [];
	private socketIO!: Server;
	private checkDeviceStatusInterval: NodeJS.Timeout | null = null;

	// Create initializeSocketIO dont have args init with port 8888
	InitializeSCADA(port?: number) {
		this.socketIO = new Server().listen(8888, {
			cors: {
				origin: "*",
			},
		});
		this.socketIO.on("connection", (socket: Socket) => {
			console.log("TCL: publicInitializeSCADA -> socket[id]=", socket.id);

			socket.on(ClientEmitMessage.GETSTATUSDEVICES, (data: any) => {
				console.log("TCL: GETSTATUSDEVICES -> socket[id]=", socket.id);
				const deviceStatusList = this.deviceList.map((device) => ({
					deviceID: device.deviceID,
					deviceName: device.deviceName,
					deviceStatus: device.deviceStatus,
					deviceIP: device.deviceIP,
					devicePort: device.devicePort,
				}));
				socket.emit(ClientEmitMessage.RECVSTATUSDEVICES, deviceStatusList);
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

		// Bắt đầu kiểm tra trạng thái các thiết bị mỗi giây
		this.checkDeviceStatusInterval = setInterval(() => {
			this.checkDeviceStatus();
		}, 3000);
	}
	private checkDeviceStatus() {
		const currentTime = Date.now();
		this.deviceList.forEach((device) => {
			//const lastDataReceivedTime = device.getLastDataReceivedTime();
			// Kiểm tra nếu thiết bị chưa nhận được dữ liệu trong vòng 10 giây
			//  if (lastDataReceivedTime && currentTime - lastDataReceivedTime > 10000) {
			//   // Thiết lập trạng thái của thiết bị là "No Data"
			//   device.setDeviceStatus(DeviceStatus.NoData);
			//   // Thông báo hoặc xử lý theo nhu cầu của bạn
			//   console.log(`Device ${device.deviceID} has no data for 10 seconds.`);
			// }
			if (device.deviceStatus == DeviceStatus.Disconnected) {
				device.connectToDevice()
			}
		});
	}
	public addDevice(device: Device): void {
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
	private handleDeviceConnected(deviceName: any, data: any) {
		// Phát sóng sự kiện cập nhật cho tất cả các clients
		const deviceStatusList = this.deviceList.map((device) => ({
			deviceID: device.deviceID,
			deviceName: device.deviceName,
			deviceStatus: device.deviceStatus,
			deviceIP: device.deviceIP,
			devicePort: device.devicePort,
		}));
		this.socketIO.emit(ClientEmitMessage.RECVSTATUSDEVICES, deviceStatusList);

		console.log(
			`${new Date().toISOString()}=TCL: handleDeviceConnected -> ${deviceName},${data}`
		);
	}
	private handleDeviceError(deviceName: string, error: any) {
		// Phát sóng sự kiện cập nhật cho tất cả các clients
		const deviceStatusList = this.deviceList.map((device) => ({
			deviceID: device.deviceID,
			deviceName: device.deviceName,
			deviceStatus: device.deviceStatus,
			deviceIP: device.deviceIP,
			devicePort: device.devicePort,
		}));
		this.socketIO.emit(ClientEmitMessage.RECVSTATUSDEVICES, deviceStatusList);

		console.log(
			`${new Date().toISOString()}=TCL: handleDeviceError -> ${deviceName},${error}`
		);
	}
	private handleDeviceClose(deviceName: string, error: any) {
		// Phát sóng sự kiện cập nhật cho tất cả các clients
		const deviceStatusList = this.deviceList.map((device) => ({
			deviceID: device.deviceID,
			deviceName: device.deviceName,
			deviceStatus: device.deviceStatus,
			deviceIP: device.deviceIP,
			devicePort: device.devicePort,
		}));
		this.socketIO.emit(ClientEmitMessage.RECVSTATUSDEVICES, deviceStatusList);
		console.log(
			`${new Date().toISOString()}=TCL: handleDeviceClose -> ${deviceName},${error}`
		);
	}
	private async handleDataFromDevice(deviceID: number, data: string) {
		// Process and handle data from the device
		try {
			callProcessDeviceData(deviceID, data).then((res) => {
				let _temp = {
					deviceID: deviceID,
					data: res
				}
				this.socketIO.emit(ClientEmitMessage.RECVDATA, _temp)
				this.deviceList.at(deviceID - 1)?.sendToDevice(`${data}|${res}`);
				console.log(`${new Date().toISOString()}=DB_res_${deviceID}: ${res}`);
			});
		} catch (error) {
			let _temp = {

				deviceID: deviceID,
				data: error
			}
			this.socketIO.emit(ClientEmitMessage.RECVDATA, _temp)

			this.deviceList.at(deviceID - 1)?.sendToDevice(`${data}|${error} \n`);
		}
		console.log(
			`${new Date().toISOString()}=Data received from ${deviceID}: ${data}`
		);
	}

	public connectAllDevices(): void {
		this.deviceList.forEach((device) => {
			device.connectToDevice();
		});
	}

	// Add other methods for handling and processing data from devices

	// Example method to get data from all connected devices
	private getDataFromAllDevices(): void {
		this.deviceList.forEach((device) => {
			// Call method to get data from each device
			// Modify as per your specific requirements
			console.log(`${device.deviceName} data: getDataFromDevice()`);
		});
	}
}

export default SCADA;
