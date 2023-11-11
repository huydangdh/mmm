import SCADA from "./models/SCADA";

var myScada = new SCADA()
myScada.initializeDevices()
myScada.connectAllDevices()
