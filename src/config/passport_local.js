const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user_model');
const bcrypt = require('bcrypt');

module.exports = function (passport) {
    const options = {
        usernameField: 'email',
        passwordField: 'sifre'
    }

    passport.use(new LocalStrategy(options , async (email, sifre, done) => {
            try {
              const _bulunanUser =  await User.findOne({ email:email});
                    if (!_bulunanUser) {
                            return done(null , false, { message: 'User Bulunamadı'});
                    } 
                    const sifreKontrol = await bcrypt.compare(sifre,_bulunanUser.sifre);
                    if(!sifreKontrol){
                        return done(null, false, { message : 'Şifre Hatalı'});
                    } else {
                        if (_bulunanUser && _bulunanUser.emailAktif == false) {
                            return done(null , false, { message: 'Lütfen emailiniz onaylayın'});
                        } 
                        return  done(null , _bulunanUser);
                    }        
            } catch (error) {
                    return done(error);
            }
    }));

    passport.serializeUser(function(user, done){
        console.log("sessiona Kaydedildi" + user.id);
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, user);
        }
    });

}