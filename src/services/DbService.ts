import { Pool } from 'pg';

// Update your connection details
const pool = new Pool({
  user: 'happ',
  host: '127.0.0.1',
  database: 'hdb',
  password: '1',
  port: 5432,
});

async function callProcessDeviceData(deviceId: number, data: string): Promise<any> {
  const client = await pool.connect();

  try {
    const result = await client.query({
      text: 'SELECT * FROM process_device_data($1, $2)',
      values: [deviceId, data],
    });

    //console.log("[I]DB: "+ result.rows[0].process_device_data);
		return result.rows[0].process_device_data
  } finally {
    client.release();
  }
}

// Example usage
export default callProcessDeviceData;
