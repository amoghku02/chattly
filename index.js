const express = require("express");
const app = express();
require('dotenv').config();
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

connectDB();

const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
    return res.status(200).send("Hello");
});

app.use("/earth", require("./src/routes/o-auth.controller"));
app.use("/mars", require("./src/routes/message.controller"));
app.use("/jupiter", require("./src/routes/user.controller"));
app.use("/saturn", require("./src/routes/auth.controller"));

app.listen(port, () => {
    console.log(`Server running on port ${port} 🔥`);

});
