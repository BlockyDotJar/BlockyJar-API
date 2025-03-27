const swaggerUi = require("swagger-ui-express");

const express = require("express");
const app = express();

const rateLimit = require("express-rate-limit");

const cors = require("cors");

const fs = require("fs")
const yaml = require("yaml");

const base = require("./routes/base");
const regex = require("./routes/v2/regex");
const links = require("./routes/v2/links");

const { UNPROCESSABLE_ENTITY, RATELIMIT_REACHED } = require("./utils/responses");

const limiter = () => rateLimit
(
    {
        windowMs: 1000,
        max: 5,
        handler: (_, res) => res.status(429).json(RATELIMIT_REACHED),
        skip: (req) => req.url === "/v2" || req.url === "/v2/docs"
    }
);

app.use(limiter)
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