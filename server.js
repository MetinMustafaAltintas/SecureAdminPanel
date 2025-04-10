const serverless = require("serverless-http");
const app = require("../../app");
console.log("App is starting");

exports.handler = serverless(app);

