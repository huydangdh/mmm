import net from "net";
import { EventEmitter } from "events";

export enum DeviceStatus {
  Connected = "Connected",
  Disconnected = "Disconnected",
  Error = "Error",
  Receiving = "Receiving"
 }

class Device extends EventEmitter {
  public deviceID: number;
  public deviceName: string;
  private deviceSocket: net.Socket;
  public deviceIP: string;
  public devicePort: number;
  public deviceStatus: string;

  constructor(
    deviceID: number,
    deviceName: string,
    deviceIP: string,
    devicePort: number
  ) {
    super(); // Kế thừa từ EventEmitter

    this.deviceID = deviceID;
    this.deviceName = deviceName;
    this.deviceIP = deviceIP;
    this.devicePort = devicePort;
    this.deviceStatus = DeviceStatus.Disconnected;
    this.deviceSocket = new net.Socket();
  }

  connectToDevice(): void {
    if(this.deviceSocket.connecting){
      this.deviceSocket.resetAndDestroy();
    }
    if(this.deviceSocket.closed) this.deviceSocket = new net.Socket();
    this.deviceSocket.connect(this.devicePort, this.deviceIP, () => {
      this.deviceStatus = DeviceStatus.Connected;
      this.emit(DeviceStatus.Connected, `${this.deviceID}_${this.deviceName}`)
    });

    this.deviceSocket.on("data", (data) => {
      // Process received data
      this.deviceStatus = DeviceStatus.Receiving;
      this.handleReceivedData(data);
    });

    this.deviceSocket.on("close", () => {
      this.deviceStatus = DeviceStatus.Disconnected;
      this.emit(DeviceStatus.Disconnected, `${this.deviceID}_${this.deviceName}`);
      //console.log(`${this.deviceName} disconnected`);
    });

    this.deviceSocket.on("error", (error) => {
      this.deviceStatus = DeviceStatus.Error;
      this.emit(DeviceStatus.Error, `${this.deviceID}_${this.deviceName}`);
      //console.error(`Error in ${this.deviceName} connection: ${error.message}`);
    });
  }
  public sendToDevice(data: any){
    this.deviceSocket.write(data);
  }
  private handleReceivedData(data: Buffer): void {
    // Process and emit event for other classes to consume
    // You can customize this based on your specific data processing needs
    // For example, you can use an EventEmitter to emit events
    // Emit event with the data
    this.emit(DeviceStatus.Receiving, {
      deviceName: this.deviceName,
      deviceID: this.deviceID,
      data: data.toString(),
    });
    this.deviceStatus = DeviceStatus.Connected
    //console.log(`${this.deviceName} received data: ${data.toString()}`);
  }
}

export default Device;
