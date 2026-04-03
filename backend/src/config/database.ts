import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres"

export function getConnectionString() {
    const DB_DRIVER = process.env.DB_DRIVER;
    const DB_USER = process.env.DB_USER;
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_HOST = process.env.DB_HOST;
    const DB_PORT = process.env.DB_PORT;
    const DATABASE = process.env.DATABASE;

    const connectionString = `${DB_DRIVER}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DATABASE}`
    return connectionString
}

export async function testDBConnection() {
    try {
        const health = await db.execute("SELECT 1")
        
        return true
    } catch (err) {
        return false
    }
}
 
const db = drizzle(getConnectionString());
export default db;
