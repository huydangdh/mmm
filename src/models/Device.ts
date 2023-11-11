import net from "net";
import { EventEmitter } from "events";

class Device extends EventEmitter {
  public deviceID: number;
  public deviceName: string;
  public deviceSocket: net.Socket;
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
    this.deviceStatus = "Disconnected";
    this.deviceSocket = new net.Socket();
  }

  connectToDevice(): void {
    this.deviceSocket.connect(this.devicePort, this.deviceIP, () => {
      this.deviceStatus = "Connected";
      this.emit("connected", `${this.deviceID}_${this.deviceName}`)
    });

    this.deviceSocket.on("data", (data) => {
      // Process received data
      this.handleReceivedData(data);
    });

    this.deviceSocket.on("close", () => {
      this.deviceStatus = "Disconnected";
      this.emit("devClose", `${this.deviceID}_${this.deviceName}`);
      //console.log(`${this.deviceName} disconnected`);
    });

    this.deviceSocket.on("error", (error) => {
      this.deviceStatus = "Disconnected";
      this.emit("devError", `${this.deviceID}_${this.deviceName}`);
      //console.error(`Error in ${this.deviceName} connection: ${error.message}`);
    });
  }

  private handleReceivedData(data: Buffer): void {
    // Process and emit event for other classes to consume
    // You can customize this based on your specific data processing needs
    // For example, you can use an EventEmitter to emit events
    // Emit event with the data
    this.emit("dataReceived", {
      deviceName: this.deviceName,
      deviceID: this.deviceID,
      data: data.toString(),
    });
    //console.log(`${this.deviceName} received data: ${data.toString()}`);
  }
}

export default Device;
