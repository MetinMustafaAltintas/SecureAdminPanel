const {validationResult } = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


const loginFormunuGoster = (req , res , next) => {
    res.render('login' , { layout: './layout/auth_layout.ejs', title:'Giriş Yap'});
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
    res.render('register' , { layout: './layout/auth_layout.ejs', title:'Kayıt Ol'});
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
    res.render('forget_password' , { layout: './layout/auth_layout.ejs' , title:'Şifremi Unuttum'});
}

const forgetPassword = async (req , res , next) => {
    const hatalar = validationResult(req);
    if(!hatalar.isEmpty()){
        req.flash('validation_error', hatalar.array());
        req.flash('email' , req.body.email);
        res.redirect('/forget-password');
    } 
        // burası çalışıyorsa kullanıcın düzgün bir mail girmiştir 
    else{
        try {
            const _user = await User.findOne({email: req.body.email , emailAktif:true});
            
            if(_user){

                const jwtBilgileri = {
                    id:_user.id,
                    mail:_user.mail
                };
                const secret = process.env.RESET_PASSWORD_JWT_SECRET+"-"+_user.sifre;
                const jwtToken = jwt.sign(jwtBilgileri, secret, {expiresIn:'1d'});


                const url = process.env.WEB_SITE_URL+'reset-password/'+_user._id+'/'+jwtToken;
                
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
                    to: _user.email,
                    subject:"Şifre Güncelleme",
                    text:"Şifrenizi oluşturmak için lütfen şu linke tıklayın:"+ url

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
            } else {
                req.flash('validation_error',[{msg :"Bu mail kayıtlı değil veya Kullanıcı pasif"}]);
                req.flash('email' , req.body.email);
                res.redirect('forget-password')
            }
        } catch (err) {
            console.log("Sifre sıfırlamada hata cıktı "+err);
        }   
    }
}

const logout = (req,res,next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((error) => {
            res.clearCookie('connect.sid');
            res.render('login', {layout:'./layout/auth_layout.ejs', title:'Giriş Yap', success_message: [{msg:'Başarıyla Çıkış Yapıldı'}]});
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
                        req.flash("error", 'Lütfen tekrar kullanıcı oluşturun');
                        res.redirect('/login');
                    }
                    }
                });

            } catch (error) {
                
            }
    } else {
        req.flash("error", 'Token Yok veya Geçersiz');
        res.redirect('/login');
    }
}

const yeniSifreyiKaydet = async (req,res,next) => {
    const hatalar = validationResult(req);
    if(!hatalar.isEmpty()){
        req.flash('validation_error', hatalar.array());
        req.flash('sifre' , req.body.sifre);
        req.flash('resifre' , req.body.resifre);
        res.redirect('/reset-password/'+req.body.id+'/'+req.body.token); 
    } else {
        const _bulunanUser = await User.findOne({_id:req.body.id, emailAktif:true});

        const secret = process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;
        
        try {
            jwt.verify(req.body.token,secret, async (e, decoded) => {

                if(e) {
                    req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                    res.redirect('/forget-password');
                } else {
                    const hashedPassword = await bcrypt.hash(req.body.sifre, 10);

                    const sonuc = await User.findByIdAndUpdate(req.body.id, { sifre : hashedPassword });
                    

                    if(sonuc){
                        req.flash("success_message", [{msg: 'Başarıyla şifre güncellendi'}]);
                        res.redirect('/login');
                    } else {
                        req.flash("error", 'Lütfen tekrar şifre sıfırlama adımları yapın');
                        res.redirect('/login');
                    }
                }
            });

        } catch (error) {
            console.log("hata çıktı: "+error);
            
        }

        
    }
}
const yeniSifreFormuGoster =async (req,res,next) => {
    const linktediID = req.params.id;
    const linktediToken = req.params.token;

    if(linktediID && linktediToken){

        const _bulunanUser = await User.findOne({_id:linktediID});

        const secret = process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;
        
        try {
            jwt.verify(linktediToken,secret, async (e, decoded) => {

                if(e) {
                    req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                    res.redirect('/forget-password');
                } else {
                    res.render('new_password', {id:linktediID,token:linktediToken,layout: './layout/auth_layout.ejs', title:'Şifre Güncelle'});

                //     const tokenIcindekiID = decoded.id;
                //     const sonuc = await User.findByIdAndUpdate(tokenIcindekiID, { emailAktif :true });
                

                // if(sonuc){
                //     req.flash("success_message", [{msg: 'Başarıyla mail onaylandı'}]);
                //     res.redirect('/login');
                // } else {
                //     req.flash("error", 'Lütfen tekrar kullanıcı oluşturun');
                //     res.redirect('/login');
                // }
                }
            });

        } catch (error) {
            
        }
        
    } else {
        req.flash('validation_error', [{ msg: "Lütfen maildeki linki tıklayın.Token bulunamadı"}]);
        req.flash('email' , req.body.email);
        res.redirect('forget-password');
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
    veriftMail,
    yeniSifreFormuGoster,
    yeniSifreyiKaydet
}