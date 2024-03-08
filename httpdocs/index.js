const swaggerUi = require("swagger-ui-express");
const express = require("express");
const app = express();

const cors = require("cors");

const fs = require("fs")
const yaml = require("yaml");

const file  = fs.readFileSync("./httpdocs/swagger.yaml", "UTF8");
const swaggerDocument = yaml.parse(file);

const v1 = require("./routes/v1");
const admins = require("./routes/admins");

app.use(express.json());
app.use(cors());

v1.setup(app);
admins.setup(app);

app.use
(
  "/v1/docs/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

const port = process.env.PORT || 3000;

app.listen(port);