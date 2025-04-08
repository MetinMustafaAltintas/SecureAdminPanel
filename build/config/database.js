const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then( () => console.log('veritanına bağlanıldı'))
    .catch( hata => console.log(`veritabanına Bağlantı Hatası ${hata}`))