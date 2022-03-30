const express = require('express');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();
const db = require('./database');
const CourseModel = require('./models/course');
const UserModel = require('./models/user');
const PinModel = require('./models/pin');
const crypto = require('crypto');
const { application } = require('express');


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
// TODO comprobar user y password en lugar del token.
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


function generatePin(){
    let pin = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return pin;
}
async function checkUserByToken(session_token) {
    return validUser = new Promise((resolve, reject) => {
        UserModel.findOne({token: session_token}, (err, user)=>{
            if(err){ 
                reject(err)
            }else if(!user) {
                reject(false)
            }else if(user) {
                resolve(true)
            }
        })
    })
}
async function getUserByToken(session_token) {
    if(!session_token){
        console.log('No existe token de sesion')
        return false
    }
    return new Promise((resolve, reject) => {
        UserModel.findOne({token: session_token}, (err, user)=>{
            if(err){
                reject(err)
            }else if(!user) {
                resolve(null)
            }else if(user) {
                resolve(user)
            }
        })
    }) 
}

async function pinExists(actualPin){
    return new Promise((resolve, reject) => {
        PinModel.findOne({pinNumber: actualPin}, (err, pinResult)=>{
            if(err){
                reject(err)
            }else if(!pinResult) {
                console.log('entra en !pinResult')
                resolve(false)
            }else if(pinResult){
                console.log('entra en true pinResult')
                resolve(true)
            }
        }) 
    })
}
// TODO pin_request
app.get('/api/pin_request', async function(req, res) {
    var user = await getUserByToken(session_token)
    var generatedPin = generatePin()
    var vrTaskId = req.query.vrTaskId || 753
    var newPin = new PinModel({})
    if(!user){
        res.status(200).json({
            status: "ERROR",
            message: 'No se encuentra usuario'
        })
        return
    } else if(user){
        newPin.userId = user.id
        newPin.exerciseId = vrTaskId
        console.log(newPin)
    }
    while(await pinExists(generatedPin)){
        console.log('pin existe')
        generatedPin = generatePin()
    }
    if(!await pinExists(generatedPin)){
        console.log('pin no existe')
        newPin.pinNumber = generatedPin
        console.log(newPin)
        await newPin.save((err, pin)=>{
            if(err){
                res.status(200).json({
                    status: "ERROR",
                    message: 'Error al guardar pin'
                })
            } else if(pin){
                res.status(200).json({
                    status: "OK",
                    message: 'Pin generado correctamente',
                    pin: pin.pinNumber
                })
            }
        })
    }
})

async function getUserById(userId){
    return new Promise((resolve, reject) => {
        UserModel.findOne({id: userId},(err,user) => {
            if(err){
                reject(err)
            }else if(!user){
                resolve(false)
            }else if(user){
                resolve(user)
            }
        }) 
    })
}

async function getTaskByPin(pinInput){
    return new Promise((resolve, reject) => {
        PinModel.findOne({pinNumber: pinInput}, (err, pinResult)=>{
            if(err){
                reject(err)
            }else if(!pinResult) {
                resolve(false)
            }else if(pinResult){
                resolve(pinResult.exerciseId)
            }
        })
    })
}

async function getEntryByPin(pinInput){
    return new Promise((resolve,reject) => {
        PinModel.findOne({pinNumber: pinInput}, (err, pinResult)=>{
            if(err){
                reject(err)
            }else if(!pinResult) {
                resolve(false)
            }else if(pinResult){
                resolve(pinResult)
            }
        })
    })
}

// TODO start_vr_exercise
app.get('/api/start_vr_exercise', async function(req, res) {
    // var pinInput = req.query.pin 
    var pinInput = parseInt(req.body.PIN) 
    var entry = await getEntryByPin(pinInput)
    var username;
    var vrTaskId;
    if(entry === false){
        res.status(404).json({
            status: "ERROR",
            message: 'Pin incorrecto'
        })
        return
    } else if(entry){
        user = await getUserById(entry.userId);
        if(!user){
            res.status(404).json({
                status: "ERROR",
                message: "No se ha podido recuperar al usuario asociado al PIN"
            })
            return
        }
        res.status(200).json({
            status: "OK",
            message: 'Exercise started',
            username: user.name,
            VRexerciseID: entry.exerciseId
        })
    }
})

async function getVrTaskById(vrTaskId){
    return new Promise((resolve, reject) => {
        CourseModel.findOne({"vr_tasks.ID":vrTaskId}, (err, task) => {
            
            if(err){
                reject(err)
            }else if(!task){
                resolve('not found')
            }else if(task){
                resolve(task)
            }
        }).select("vr_tasks.$").where({"vr_tasks.ID": vrTaskId})
    })
}



// TODO finish_vr_exercise
app.post('/api/finish_vr_exercise', async function(req, res) {
    var student;
    var inputPin = parseInt(req.body.PIN)
    var autograde = {
        passed_items: parseInt(req.body.autograde.passed_items),
        failed_items: parseInt(req.body.autograde.failed_items),
        score: parseInt(req.body.autograde.score),
        comments: "...to be decided"
    }
    var VRexerciseID = parseInt(req.body.VRexerciseID)
    var exerciseVersionID = parseInt(req.body.exerciseVersion)
    var performance_data = {
        VRexID: parseInt(VRexerciseID),
        exerciseVersion: parseInt(exerciseVersionID),
        position_data: {TODO: "complete"}
    }
    var entry = await getEntryByPin(inputPin)
    if(entry===false){
        return
    }else if(entry){
        student = entry.userId;
    }
    var completion = {
        studentID: student,
        position_data: performance_data.position_data,
        autograde: autograde,
        grade: 9,
        feedback: "Sin querer has curado una trombosis. Buen trabajo"
    }
    

    CourseModel.updateOne({"vr_tasks.ID":entry.exerciseId},{$push: {"vr_tasks.$.completions": completion}}, (err, updated) => {
        if(err){
            res.status(500).send({
                status: "ERROR",
                message: "Ha ocurrido un error en la peticion"
            })
        }else if(updated){
            res.status(200).send({
                status: 'OK',
                message: "Los datos del ejercicio se han guardado correctamente"
            })
        }
    })
            

    

    // var task = await getVrTaskById(5);
    // console.log(task.vr_tasks[0])
    // if (task.vr_tasks.length === 1){
    //     await CourseModel.updateOne({"vr_tasks.ID":entry.exerciseId},{$push: {"vr_tasks.$.completions": completion}}, (err, updated) => {
    //         if(err){
    //             res.status(500).send({
    //                 status: "ERROR",
    //                 message: "Ha ocurrido un error en la peticion"
    //             })
    //         }else if(updated){
    //             res.status(200).send({
    //                 status: 'OK',
    //                 message: "Los datos del ejercicio se han guardado correctamente"
    //             })
    //         }
    //     })
    // }

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

dbConnection();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

