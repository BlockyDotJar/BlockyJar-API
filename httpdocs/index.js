const swaggerUi = require("swagger-ui-express");

const express = require("express");
const app = express();

const cors = require("cors");

const fs = require("fs")
const yaml = require("yaml");

const base = require("./routes/base");
const regex = require("./routes/v2/regex");
const links = require("./routes/v2/links");

const { UNPROCESSABLE_ENTITY } = require("./utils/responses");

app.use(express.json());
app.use(cors());

// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) =>
{
    const response = UNPROCESSABLE_ENTITY(error);
    return res.status(422).jsonp(response);
});

base.setup(app);
regex.setup(app);
links.setup(app);

const file = fs.readFileSync("./httpdocs/swagger.yaml", "UTF8");
const swaggerDocument = yaml.parse(file);

app.use
(
    "/v2/docs", 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

const port = process.env.PORT || 3000;

app.listen(port);