import { Pool } from "pg";

// Update your connection details
const pool = new Pool({
  user: "happ",
  host: "127.0.0.1",
  database: "hdb",
  password: "1",
  port: 5432,
});

async function callProcessDeviceData(
  deviceId: number,
  data: string
): Promise<any> {
  try {
    const client = await pool.connect();

    const result = await client.query({
      text: "SELECT * FROM process_device_data($1, $2)",
      values: [deviceId, data],
    });

    //console.log("[I]DB: "+ result.rows[0].process_device_data);
    return result.rows[0].process_device_data;
  } catch (err) {
    console.log("TCL: callProcessDeviceData_err", err);
    return err
  } finally {
  }
}

// Example usage
export default callProcessDeviceData;
