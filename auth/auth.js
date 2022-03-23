app.get('/api/login',(req,res) => {
    
    let username=req.query.username
    let password=req.query.password
    console.log(req.query.username)
    UserModel.findOne({name: username}, async function(err, user){
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
        } else {
            if (user.password === password) {
            console.log('login correcto')
            if (!user.token || user.token === '' || user.token === null) {
                console.log('no hay token')
                user.token = generateToken(username, password);
                console.log(user.token)
                await user.save()
                const token = user.token;
                return token
            } else {
                console.log('token existe')
                console.log(user)
            }
            res.status(200).json({
                status: 'login correcto'
            })
            } else {
                console.log('password incorrecto')
                res.status(200).json({
                    status: 'ERROR password incorrect'
                })
            }
        } 
    })   
})