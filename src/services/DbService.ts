import { Pool, Client, QueryResult } from "pg";

// Update your connection details
const pool = new Pool({
  user: "huiapp",
  host: "127.0.0.1",
  database: "huidb",
  password: "",
  port: 5432,
  max: 10
});


pool.on("error",(err, client)=>{
	console.log("TCL: err", err)
})

async function callProcessDeviceData(
  deviceId: number,
  data: string
): Promise<any> {

  let res: any;
  try {
    const result = await pool.query({
      text: "SELECT * FROM process_device_data($1, $2)",
      values: [deviceId, data],
    });
    res = result.rows[0].process_device_data;
  } catch (error) {
    res = error;
  }

  return res;
}

// Example usage
export default callProcessDeviceData;
