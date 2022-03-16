const express = require('express');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();
const db = require('./database');
const CourseModel = require('./models/course');
const UserModel = require('./models/user');


// Crear el servidor express
const app = express();

// Lectua y parseo del body
app.use(express.json());

//GET
app.get('/', (req,res) => {
    res.status(200).json({
        status: 'OK',
        ok: true,
        mensaje: 'Petición realizada correctamente',
        uid: 666
    })
});

app.get('/api/login',(req,res) => {
    
    let username=req.query.username
    let password=req.query.password
    console.log(req.query.username)
    UserModel.findOne({name: username}, function(err, user){
        if (err) {
            console.log('Error')
            res.status(404).json({
                status: 'ERROR EN LA PETICIÓN',
            })
        } else if (!user){
            console.log('usuario no encontrado')
            res.status(200).json({
                status: 'ERROR user not found'
            })
        } else {console.log(user)} 
    })   
})

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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

