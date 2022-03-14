// import npm packages
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DATABSE_URL || 'mongodb://localhost/3000';
const client = new MongoClient(uri);
const dbName = 'classVRroom';

const app = express();
const PORT = process.env.PORT || 3000;




//Data parsing
app.use(experess.json());
app.use(express.urlencoded({ extended: true }));

app.get('/test', function(req, res){
    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        console.log(req.url)
        var result = await dbo.collection('courses').find({}).toArray();
            console.log(result);
            res.json(result);
        
        db.close();
    });
});

app.listen(PORT, console.log(`Server is starting at ${PORT}`));