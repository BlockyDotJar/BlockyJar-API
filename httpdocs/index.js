/* eslint-disable no-unexpected-multiline */

const swaggerUi = require("swagger-ui-express");

const express = require("express");
const app = express();

const cors = require("cors");

const fs = require("fs")
const yaml = require("yaml");

const file  = fs.readFileSync("./httpdocs/swagger.yaml", "UTF8");
const swaggerDocument = yaml.parse(file);

const version = require("./routes/version");
const admins = require("./routes/admins");
const owners = require("./routes/owners");

app.use(express.json());
app.use(cors());

version.setup(app);
admins.setup(app);
owners.setup(app);

app.use
(
    "/v1/docs/", 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

const port = process.env.PORT || 3000;

app.listen(port);