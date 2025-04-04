const {validationResult } = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


const loginFormunuGoster = (req , res , next) => {
    res.render('login' , { layout: './layout/auth_layout.ejs'});
}
const login = (req , res , next) => {

    const hatalar = validationResult(req);
    if(!hatalar.isEmpty()){
        req.flash('validation_error', hatalar.array());
        req.flash('email' , req.body.email);
        req.flash('sifre' , req.body.sifre);
        return res.redirect('/login');
    }

    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true 
    })(req, res , next);

}

const registerFormunuGoster = (req , res , next) => {
    res.render('register' , { layout: './layout/auth_layout.ejs'});
}
const register = async (req , res , next) => {

    const hatalar = validationResult(req);
    if(!hatalar.isEmpty()){
        req.flash('validation_error', hatalar.array());
        req.flash('email' , req.body.email);
        req.flash('ad' , req.body.ad);
        req.flash('soyad' , req.body.soyad);
        req.flash('sifre' , req.body.sifre);
        req.flash('resifre' , req.body.resifre);
        res.redirect('/register');
    } else {
        try {
            const _user = await User.findOne({email: req.body.email});
            console.log("Kullanıcı bulundu"); 

            if(_user && _user.emailAktif == true){
                req.flash('validation_error',[{msg :"Bu mail kullanımda"}]);
                req.flash('email' , req.body.email);
                req.flash('ad' , req.body.ad);
                req.flash('soyad' , req.body.soyad);
                req.flash('sifre' , req.body.sifre);
                req.flash('resifre' , req.body.resifre);
                res.redirect('/register');
            }else if( (_user && _user.emailAktif == false) || _user == null){

                if(_user){
                   await  User.findByIdAndDelete({_id: _user._id});
                   console.log("Kullanıcı Silindi"); 
                }
                const newUser = new User({
                    email:req.body.email,
                    ad:req.body.ad,
                    soyad:req.body.soyad,
                    sifre:await bcrypt.hash(req.body.sifre, 10),
                });
                await newUser.save();
                console.log("kullanıcı kaydedildi");


                // jwt işlemleri

                const jwtBilgileri = {
                    id:newUser.id,
                    mail:newUser.email
                };

                const jwtToken = jwt.sign(jwtBilgileri, process.env.CONFIRM_MAIL_JWT_SECRET, {expiresIn:'1d'});
              //  console.log(jwtToken);

                // Mail gönderme işlemleri
                const url = process.env.WEB_SITE_URL+'verify?id='+jwtToken;
                console.log(url);
                
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_SIFRE,
                    },
                });

                await transporter.sendMail({
                    from:'NodeJs Uygulaması <info@nodejskursu.com>',
                    to: newUser.email,
                    subject:"Emailinizi lütfen Onaylayın",
                    text:"Emailinizi onaylamak için lütfen şu linke tıklayın:"+ url

                }, (error, info) => {
                        if(error){
                            console.log("bir hata var "+ error);
                            
                        }
                        console.log("mail gönderildi");
                        console.log(info);
                        transporter.close();
                        });
                        req.flash('success_message' , [{ msg: 'Lütfen Mail Kutunuzu Kontrol Ediniz' }]);
                res.redirect('./login');
            }
            
        } catch (err) { 
            console.log("user kaydedilirken hata çıktı " + err); 
            
        }
    }
}


const forgetPasswordFormunuGoster = (req , res , next) => {
    res.render('forget_password' , { layout: './layout/auth_layout.ejs'});
}

const forgetPassword = (req , res , next) => {
    console.log(req.body);
    res.render('forget_password' , { layout: './layout/auth_layout.ejs'});
}

const logout = (req,res,next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((error) => {
            res.clearCookie('connect.sid');
            res.render('login', {layout:'./layout/auth_layout.ejs', success_message: [{msg:'Başarıyla Çıkış Yapıldı'}]});
        })
    });
}

const veriftMail = (req,res,next) => {
    const token = req.query.id;
    if(token){
            try {
                jwt.verify(token,process.env.CONFIRM_MAIL_JWT_SECRET, async (e, decoded) => {

                    if(e) {
                        req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                        res.redirect('/login');
                    } else {
                        const tokenIcindekiID = decoded.id;
                        const sonuc = await User.findByIdAndUpdate(tokenIcindekiID, { emailAktif :true });
                    

                    if(sonuc){
                        req.flash("success_message", [{msg: 'Başarıyla mail onaylandı'}]);
                        res.redirect('/login');
                    } else {
                        req.flash("error", [{msj: 'Lütfen tekrar kullanıcı oluşturun'}]);
                        res.redirect('/login');
                    }
                    }
                });

            } catch (error) {
                
            }
    } else {
        console.log("Token yok");
    }
}

module.exports = {
    loginFormunuGoster,
    registerFormunuGoster,
    forgetPasswordFormunuGoster,
    register,
    login,
    forgetPassword,
    logout,
    veriftMail
}