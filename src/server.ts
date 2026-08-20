import app from "./app.ts";
import { envVars } from "./config/env.ts";

const startServer = async () => {
    try {
        app.listen(envVars.PORT, () => {
            console.log(`✅ Server is listening on port ${envVars.PORT}`);
        });
    } catch (error) {
        console.log(`❌ Error from server`, error);
    }
};

startServer();