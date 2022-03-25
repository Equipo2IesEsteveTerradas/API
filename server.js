const express = require('express');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();
const db = require('./database');
const CourseModel = require('./models/course');
const UserModel = require('./models/user');
const crypto = require('crypto');


// Crear el servidor express
const app = express();



// Lectua y parseo del body
app.use(express.json());

// needed code 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//GET
app.get('/', (req,res) => {
    res.status(200).json({
        status: 'OK',
        ok: true,
        mensaje: 'Petición realizada correctamente',
        uid: 666
    })
});


// TODO separar la logica del login&logout en un archivo aparte
var session_token; // variable para almacenar el token

// ------------------- LOGIN ENDPOINT ----------------------
app.get('/api/login',(req,res) => {
    
    let username=req.query.username
    let password=req.query.password
    // console.log(req.query.username)
    UserModel.findOne({name: username}, async function(err, user){

        if (err) {
            console.log('Error')
            res.status(404).json({
                status: 'ERROR',
                message: 'Error en la petición'
            })
        } else if (!user){
            console.log('usuario no encontrado')
            res.status(200).json({
                status: "ERROR",
                message: 'usuario no encontrado',
                session_token: null
            })
        } else {
            if (user.password === password) {
            console.log('login correcto')
            if (!user.token || user.token === '' || user.token === null) {
                console.log('no hay token')
                user.token = generateToken(username, password);
                console.log(Date.now());
                user.expiration_time = Date.now() + (process.env.TOKEN_EXPIRATION_TIME * 60000);
                console.log(user.token)
                console.log(user.expiration_time)
                await user.save()
                session_token = user.token;
            } else {
                console.log('token existe')
                console.log(Date.now());
                session_token = user.token;
                user.expiration_time = Date.now() + (process.env.TOKEN_EXPIRATION_TIME * 60000);
                await user.save()
                console.log(user)                          
            }
            res.status(200).json({
                status: 'OK',
                message: 'login correcto',
                session_token: user.token
            })
            } else {
                console.log('password incorrecto')
                res.status(200).json({
                    status: 'ERROR',
                    message: 'contraseña incorrecta',
                    session_token: null
                })
            }
        } 
    })   
});

// ----------------LOGOUT ENDPONT-----------------------------
app.get('/api/logout', (req, res)=>{
    UserModel.findOne({token: session_token }, async function(err, user){
        if (err) {
            console.log('Error')
            res.status(404).json({
                status: 'ERROR',
                message: 'Error en la petición'
            })
        } else if(!session_token){
            res.status(200).json({
                status: "ERROR",
                message: 'no existe token de sesion',
                session_token: null
            })
        }else if(user){
            user.token = null;
            user.expiration_time = Date.now();
            await user.save();
            res.status(200).json({
                status: 'OK',
                message: 'Logout realizado correctamente',
                session_token: user.token
            })

        } else if(!user){
            res.status(200).json({
                status: "ERROR",
                message: 'usuario no encontrado',
                session_token: null
            })
        }
    })
});

// ---------------ENDPOINT GET_COURSES----------------

app.get('/api/get_courses', (req, res)=>{
    UserModel.findOne({token: session_token}, (err, user)=>{
        if(err){
            console.log('Error')
            res.status(404).json({
                status: 'ERROR',
                message: 'Error en la petición'
            })
        } else if(!session_token){
            res.status(200).json({
                status: "ERROR",
                message: 'no existe token de sesion',
                session_token: null
            })
        }else if(!user){
            res.status(200).json({
                status: "ERROR",
                message: 'usuario no encontrado',
                session_token: null
            })
        } else if (user) {
            console.log(user)
            CourseModel.find({$or: [{'subscribers.students': user.id}, {'subscribers.teachers': user.id}]}, async (err,courses)=>{
                let response = []
                console.log('1')
                courses.forEach(course => {
                    var courseTeachers = []
                    course.subscribers.teachers.forEach(teacherId =>{
                        // console.log(teacher)
                        // courseTeachers.push(teacher)
                        UserModel.findOne({id: teacherId}, (err, teacher)=>{
                            if(err){
                                console.log('Error')
                                res.status(404).json({
                                    status: 'ERROR',
                                    message: 'Error en la petición'
                                })
                            }
                            else if(teacher){
                                courseTeachers.push(teacher.name)
                                console.log(courseTeachers)
                                course.subscribers.teachers = courseTeachers
                                console.log('3')
                            
                                
                            }
                        })
                    })
                    console.log('4')
                    console.log(courseTeachers)
                    response.push({
                        courseID: course.id,
                        title: course.title,
                        description: course.description,
                        teachers: course.subscribers.teachers,
                    })
                }); 
                res.status(200).json({
                    status: 'OK',
                    message: 'Cursos recuperados correctamente',                        
                    course_list: response
                })
                })
        }
    })
})

// ---------------ENDPOINT GET COURSE DETAILS
app.get('/api/get_course_details', (req, res)=>{
    const idCourse = req.query.id
    UserModel.findOne({token: session_token}, async(err, user)=>{
        if(err){
            console.log('Error')
            res.status(404).json({
                status: 'ERROR',
                message: 'Error en la petición'
            })
        } else if(!session_token){
            res.status(200).json({
                status: "ERROR",
                message: 'no existe token de sesion',
                session_token: null
            })
        }else if(!user){
            res.status(200).json({
                status: "ERROR",
                message: 'usuario no encontrado',
                session_token: null
            })
        } else if (user) {
            console.log(user)
            CourseModel.find({$or: [{'subscribers.students': user.id}, {'subscribers.teachers': user.id}], _id: idCourse}, (err,courses)=>{
                console.log(courses)
                res.status(200).json({
                    status: "OK",
                    message: "Detalle del curso obtenido correctamente",
                    course: courses
                })
            })
        }
    })
})

// ---------------ENDPOINT EXPORT_DATABASE----------------
app.get('/api/export_database', (req, res)=>{
    UserModel.findOne({token: session_token}, (err, user)=>{
        if(err){
            console.log('Error')
            res.status(404).json({
                status: 'ERROR',
                message: 'Error en la petición'
            })
        } else if(!session_token){
            res.status(200).json({
                status: "ERROR",
                message: 'no existe token de sesion',
                session_token: null
            })
        }else if(!user){
            res.status(200).json({
                status: "ERROR",
                message: 'usuario no encontrado',
                session_token: null
            })
        } else if (user) {
            if(user.admin){
            
                CourseModel.find({}, (err, data)=>{
                    if(err){
                        console.log('Error')
                        res.status(404).json({
                            status: 'ERROR',
                            message: 'Error en la petición'
                        })
                    } else if(data){
                        res.status(200).json({
                            status: "OK",
                            message: "Base de datos exportada correctamente",
                            data: data
                        })
                    }
                })
            } else {
                res.status(200).json({
                    status: "ERROR",
                    message: 'No tienes permisos para realizar esta acción'
                })
            }
        }
    })
})

// -------------EXPORT DATABASE FOR TESTING----------------
app.get('/api/export_database666', (req, res)=>{
    
            
    CourseModel.find({}, (err, data)=>{
        if(err){
            console.log('Error')
            res.status(404).json({
                status: 'ERROR',
                message: 'Error en la petición'
            })
        } else if(data){
            res.status(200).json({
                status: "OK",
                message: "Base de datos exportada correctamente",
                data: data
            })
        }
    })
})


// -------CONNECTION TEST FUNCTION-------------
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




//  method to generate a random token
function generateToken(username, password) {
    var random = Math.random().toString(36).substring(7);
    hash = crypto.getHashes();
    createdHash = crypto.createHash('sha256').update(username + password + random).digest('hex').substring(32);
    // console.log(createdHash);
    return createdHash;
}

// METHOD TO GET USER FROM DB BY IT'S TOKEN
function getUserByToken(UserModel, token){
    UserModel.findOne({token: token}, (err, user)=>{
        if(err){
            console.log('Error durante la query')
        } else if (!user){
            console.log('no se ha encontrado el usuario')
        } else if(user){
            return user
        }
    })
}

dbConnection();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

