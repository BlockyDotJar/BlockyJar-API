const swaggerUi = require("swagger-ui-express");

const express = require("express");
const app = express();

const cors = require("cors");

const fs = require("fs")
const yaml = require("yaml");

const version = require("./routes/version");
const regex = require("./routes/v1/regex");
const flags = require("./routes/v1/flags");
const user = require("./routes/v1/apujar/internal/user");
const admins = require("./routes/v1/apujar/admins");
const owners = require("./routes/v1/apujar/owners");
const bible = require("./routes/v1/apujar/bible");

app.use(express.json());
app.use(cors());

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    return res.status(422).json
    (
        {
            "status": 422,
            "message": err.message
        }
    )
})

version.setup(app);
regex.setup(app);
flags.setup(app);
user.setup(app);
admins.setup(app);
owners.setup(app);
bible.setup(app);

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