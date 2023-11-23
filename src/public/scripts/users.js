// ***** Start **** //
const ClientEmitMessage = {
  GETSTATUSDEVICES: "GetStatusDevices",
  RECVSTATUSDEVICES: "RECVSTATUSDEVICES",
};

const socket = io("http://127.0.0.1:8888");
socket.on("connect", () => {
  console.log("TCL: socket[id]=", socket.id);
  socket.emit(ClientEmitMessage.GETSTATUSDEVICES, "");

  socket.on(ClientEmitMessage.RECVSTATUSDEVICES, (deviceStatusList) => {
    console.log("TCL: RECVSTATUSDEVICES=", deviceStatusList);
    updateDeviceStatusList(deviceStatusList);
  });
});

function updateDeviceStatusList(deviceStatusList) {
  const table = document.getElementById("deviceTable");
  const tbody = table.querySelector("tbody");

  deviceStatusList.forEach((deviceStatus) => {
    const {
      deviceID,
      deviceName,
      deviceStatus: status,
      deviceIP,
      devicePort,
    } = deviceStatus;

    // Check if the row already exists for the device
    const existingRow = tbody.querySelector(`tr[data-device-id="${deviceID}"]`);

    if (existingRow) {
      // Update existing row
      const statusCell = existingRow.querySelector(".status");
      const ipCell = existingRow.querySelector(".ip");
      const portCell = existingRow.querySelector(".port");

      statusCell.textContent = status;
      ipCell.textContent = deviceIP;
      portCell.textContent = devicePort;

      // Remove existing status class
      existingRow.classList.remove("connected", "receiving", "disconnected");

      // Add new status class
      switch (status) {
        case "Connected":
          existingRow.classList.add("connected");
          break;
        case "Receiving":
          existingRow.classList.add("receiving");
          break;
        case "Disconnected":
          existingRow.classList.add("disconnected");
          break;
        default:
          break;
      }
    } else {
      // Add a new row for the device
      const newRow = document.createElement("tr");
      newRow.setAttribute("data-device-id", deviceID);
      newRow.innerHTML = `
        <td>${deviceID}</td>
        <td>${deviceName}</td>
        <td class="status">${status}</td>
        <td class="ip">${deviceIP}</td>
        <td class="port">${devicePort}</td>
      `;

      // Add status class to the new row
      switch (status) {
        case "Connected":
          newRow.classList.add("connected");
          break;
        case "Receiving":
          newRow.classList.add("receiving");
          break;
        case "Disconnected":
          newRow.classList.add("disconnected");
          break;
        default:
          break;
      }

      tbody.appendChild(newRow);
    }
  });
}
