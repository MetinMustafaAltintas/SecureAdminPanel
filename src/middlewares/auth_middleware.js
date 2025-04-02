const oturumAcilmis = function (req , res , next) {
    if(req.isAuthenticated()){
        return next();
    }
    else {
        req.flash('error' , ['Lütfen önce oturum açın']);
        req.redirect('/login');
    }
}

module.exports = {
    oturumAcilmis
}

