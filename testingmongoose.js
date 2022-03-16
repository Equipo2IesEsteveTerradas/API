const { main } = require('@popperjs/core');
const express = require('express');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

// testing().catch(err => console.log(err));

async function testing(){
    await mongoose.connect(process.env.DATABASE_URL);
    console.log(mongoose.connection.readyState);
    const catSchema = new mongoose.Schema({
        name: String
    });
    const Cat = mongoose.model('Cats', catSchema);
    const testCat = new Cat({name: 'Test'});
    await testCat.save();
}

app.get('/testsave', (req, res) => {
    testing().then(() => {
        console.log('saved');
    });
})

app.get('/', (req,res) => {
    res.status(200).json({
        status: 'OK',
        ok: true,
        mensaje: 'Petición realizada correctamente',
        uid: 666
        })
    })




app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});