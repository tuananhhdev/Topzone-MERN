"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./src/app"));
const globalConfig_1 = __importDefault(require("./src/configs/globalConfig"));
const PORT = globalConfig_1.default.PORT;
mongoose_1.default
    .connect(globalConfig_1.default.MONGODB_URI)
    .then(() => {
    console.log("⚡️[MongoDB]: Connected to MongoDB successfully");
    //should listen app here
})
    .catch((err) => {
    console.error("Failed to Connect to MongoDB", err);
});
app_1.default.listen(PORT, () => {
    console.log(`⚡️[Express]: listening on port http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map