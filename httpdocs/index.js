const swaggerUi = require("swagger-ui-express");

const express = require("express");
const app = express();

const cors = require("cors");

const fs = require("fs")
const yaml = require("yaml");

const base = require("./routes/base");
const regex = require("./routes/v1/regex");
const flags = require("./routes/v1/flags");
const links = require("./routes/v1/links");

app.use(express.json());
app.use(cors());

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) =>
{
    return res.status(422).json
    (
        {
            "status": 422,
            "message": err.message
        }
    );
});

base.setup(app);
regex.setup(app);
flags.setup(app);
links.setup(app);

const file = fs.readFileSync("./httpdocs/swagger.yaml", "UTF8");
const swaggerDocument = yaml.parse(file);

app.use
(
    "/v1/docs", 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

const port = process.env.PORT || 3000;

app.listen(port);