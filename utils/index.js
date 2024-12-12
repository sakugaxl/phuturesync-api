const { errorHandler } = require("./helpers");
const { uploadProcessedData } = require("./firebase");

async function handler(req, method) {
    try {
        if (method === "GET") {
            const path = req.path;
            const testUrl = "http://localhost:3000/api/test";
            if (path === "/test") {
                const data = await processTheCollection(testUrl);
                return JSON.stringify(data);
            }
            if (path === "/test-upload") {
                await uploadProcessedData();
                return "Successful";
            }
            if (path === "/test-get") {
                await getTheData();
                return "Successful";
            }
            
            return "Hello Get";
        }

        return "Unknown request";
    } catch (error) {
        errorHandler(error, "mainIndexHandler");
    }
}

module.exports = { handler };