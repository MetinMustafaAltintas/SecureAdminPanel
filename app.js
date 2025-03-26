const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');

// routerler include edilir
const authRouter = require('./src/routers/auth_router');

// DB bağlantısı
require('./src/config/database');

// session ve flash message
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave : false,
        saveUninitialized: true,
        cookie: {
            maxAge:1000
        }
    }
));

app.use(flash());
app.use((req,res,next) => {
    res.locals.validation_error = req.flash('validation_error');
    res.locals.email = req.flash('email');
    res.locals.ad = req.flash('ad');
    res.locals.soyad = req.flash('soyad');
    res.locals.sifre = req.flash('sifre');
    res.locals.resifre = req.flash('resifre');



    next();
});

// formdan gelen değerlerin okuna bilmesi için 
app.use(express.urlencoded({extended: true}));

//template engine ayarları
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
app.use(expressLayouts);
app.use(express.static('public'));
app.set('view engine' , 'ejs');
app.set('views', path.resolve(__dirname, './src/views'));

app.get('/' , (req, res) => {
    res.json({ mesaj: 'merhaba'});
})

app.use('/', authRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server ${process.env.PORT} portundan ayaklandı`)
});