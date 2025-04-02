const {validationResult } = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);


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

            if(_user){
                req.flash('validation_error',[{msg :"Bu mail kullanımda"}]);
                req.flash('email' , req.body.email);
                req.flash('ad' , req.body.ad);
                req.flash('soyad' , req.body.soyad);
                req.flash('sifre' , req.body.sifre);
                req.flash('resifre' , req.body.resifre);
                res.redirect('/register');
            }else{
                const newUSer = new User({
                    email:req.body.email,
                    ad:req.body.ad,
                    soyad:req.body.soyad,
                    sifre:req.body.sifre,
                });
               // await newUser.save();
                newUSer.save()
                console.log("kullanıcı kaydedildi");

                req.flash('success_message' , [{ msg: 'Giriş yapabilirsiniz' }]);
                res.redirect('./login');
            }
            
        } catch (err) {
            
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

module.exports = {
    loginFormunuGoster,
    registerFormunuGoster,
    forgetPasswordFormunuGoster,
    register,
    login,
    forgetPassword
}