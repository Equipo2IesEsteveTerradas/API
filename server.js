const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();


// Crear el servidor express
const app = express();

// Lectua y parseo del body
app.use(express.json());

//GET
app.get('/', (req,res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente',
        uid: 666
    })
});

const dbConnection = async() => {
    try{
        await mongoose.connect(process.env.DATABASE_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Base de datos conectada');
    } catch ( err ) {
        console.log(err);
        throw new Error('Error al conectar con la base de datos');
    }
}

dbConnection();

app.listen(3000, () => {
    console.log(`Servidor corriendo en el puerto ${3000}`);
});

