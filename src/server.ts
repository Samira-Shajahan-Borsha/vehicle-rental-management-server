import app from "./app.js";

const startServer = async () => {
    try {
        app.listen(5000, () => {
            console.log(`✅ Server is listening on port 5000`);
        });
    } catch (error) {
        console.log(`❌ Error from server`, error);
    }
};

startServer();