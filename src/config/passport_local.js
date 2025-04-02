const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user_model');

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
                    if (_bulunanUser.sifre !== sifre) {
                            return done(null, false, { message : 'Şifre Hatalı'});
                    } else {
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