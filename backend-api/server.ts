import mongoose from "mongoose";
import app from "./src/app";
import globalConfig from "./src/configs/globalConfig";

const PORT = globalConfig.PORT;

mongoose
  .connect(globalConfig.MONGODB_URI as string)
  .then(() => {
    console.log("⚡️[MongoDB]: Connected to MongoDB successfully");
    //should listen app here
  })
  .catch((err) => {
    console.error("Failed to Connect to MongoDB", err);
  });

app.listen(PORT, () => {
  console.log(`⚡️[Express]: listening on port http://localhost:${PORT}`);
});
