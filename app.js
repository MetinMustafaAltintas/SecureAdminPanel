const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

// DB bağlantısı
require('./src/config/database');

const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
app.use(expressLayouts);
app.set('view engine' , 'ejs');
app.set('views', path.resolve(__dirname, './src/views'));

app.get('/' , (req, res) => {
    res.json({ mesaj: 'merhaba'});
})

app.listen(process.env.PORT, () => {
    console.log(`Server ${process.env.PORT} portundan ayaklandı`)
});