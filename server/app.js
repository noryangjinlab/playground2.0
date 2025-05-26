const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const labRouter = require("./routes/labRouter");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/lab", labRouter);

app.listen(PORT, ()=>{
	console.log(`listening at ${PORT}`);
})