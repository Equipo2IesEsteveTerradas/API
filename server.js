const express = require('express');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const conn = require('./database');
const courseModel = require('./models/course');
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

// test connection w/ mongo atlas
dbConnection();



app.get('/get_courses', async (req, res) => {
    await courseModel.find({}, (err, courses) => {
        if(err) throw err;
        res.status(200).json({
            ok: true,
            courses: courses
        })
    })
    
});

app.get('/get_courses2', async (req, res) => {
    const doc = await courseModel.find({}).exec();
    
    console.log(res.json(doc));  
});



app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

