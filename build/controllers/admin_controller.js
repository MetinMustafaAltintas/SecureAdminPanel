const User = require('../model/user_model');

const anaSayfayiGoster = function (req,res,next){
    res.render('index' , { layout: '../views/layout/admin_layout.ejs', title:'Admin Paneli Ana Sayfa'})

}

const profilSayfasiniGoster = function (req,res,next){
    res.render('profil' , {user:req.user , layout: '../views/layout/admin_layout.ejs', title:'Profil Sayfası'})
}

const profilGuncelle = async function (req,res,next){

    const guncelBilgiler = {
        ad:req.body.ad,
        soyad:req.body.soyad
    }

    try {
       if(req.file){
        guncelBilgiler.avatar = req.file.filename;
       }

       const sonuc = await User.findByIdAndUpdate(req.user.id,guncelBilgiler );
        
       if(sonuc){
        res.redirect('/admin/profil');
       }
        
    } catch (error) {
        console.log(error);
        
    }

    res.render('profil' , {user:req.user , layout: '../views/layout/admin_layout.ejs'})
}



module.exports = {
    anaSayfayiGoster,
    profilSayfasiniGoster,
    profilGuncelle
}