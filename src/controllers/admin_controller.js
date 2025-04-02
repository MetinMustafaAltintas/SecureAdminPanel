const anaSayfayiGoster = function (req,res,next){
    res.render('index' , { layout: '../views/layout/admin_layout.ejs'})

}

module.exports = {
    anaSayfayiGoster
}