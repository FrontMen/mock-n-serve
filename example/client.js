"use strict";
const express = require("express");
let app = express();
app.use(express.static('example'));

app.listen(3000);