"use strict";

const express 			= require("express");
const MongoClient		= require('mongodb').MongoClient
const ObjectId          = require('mongodb').ObjectId
const validator         = require('validator')
const path              = require('path')
const app 				= express();


const urlmongo      	= 'mongodb://mongos:XRIIIIIIIIllllllliiioooOOOO0000oOAAAAaadmnJkL3268KjGdrEaA6PfBUzfIrS27smzz@127.0.0.1:27017/'
const option        	= { useUnifiedTopology: true } // mongo
const dbName            = "DbTodo"
const collectionTodo  	= "collectionTodo"



app.listen(3000, () => console.log("Server Up and running"));

// app.use("/static", express.static("/public"));
app.use("/public", express.static("/public"));
// app.use(express.static(path.join(__dirname, '/public')))
// app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));


app.set("view engine", "ejs");


app.get('/todo/:id',(req, res) => {
    
	MongoClient.connect(urlmongo, option, function(err, db) {
        // if (err) throw err;  // when db is empty
    	var id = req.params.id
        var dbo = db.db(dbName);
        var find = { _id: new ObjectId(id) };
        var list = {};

        dbo.collection(collectionTodo).find(find).toArray().then(result => {
           
            // console.log(JSON.stringify(list.resultChecked));
			res.render('todoOne.ejs', {
		        todos: result
    		});

        }).catch(e => {
            db.close();
            console.error(e);
        });

	});
});


app.get('/',(req, res) => {

	MongoClient.connect(urlmongo, option, function(err, db) {
        // if (err) throw err;  // when db is empty
        var dbo = db.db(dbName);
        var findChecked = {checked: true};
        var findUnchecked = {checked: false};
		var mysort = { created: -1 };
		var mysort2 = { updated: -1 };
        var list = {};

        dbo.collection(collectionTodo).find(findChecked).sort(mysort).toArray().then(result => {
            list.resultChecked = result
            
        }).then(() => {

            dbo.collection(collectionTodo).find(findUnchecked).sort(mysort2).toArray().then(result2 => {
            list.resultUnchecked = result2

	        }).then(() => {
		        db.close();
	            // console.log(JSON.stringify(list.resultChecked));
				res.render('todo.ejs', {
			        todosChecked: list.resultChecked,
			        todosUnchecked: list.resultUnchecked
			  
		        });

	        }).catch(e => {
	            db.close();
	            console.error(e);
	        });

    	});

	});
});


app.post('/add', function (req, res) {

	MongoClient.connect(urlmongo, option, function(err, db) {
        if (err) throw err;
        try {
            var dbo = db.db(dbName);
            var f = req.body.form;

            f.title 	= f.title.trim()
            f.content 	= f.content.trim()

            if (
               (f.title && validator.isLength(f.title, { min: 1, max: 200 })) &&
               (!f.content || (f.content && validator.isLength(f.content, { min: 0, max: 200 }))) 
               )
            {

                var myobj = {
                    title: f.title,
                    content: f.content,
                    checked: false,
                    created: Date.now(),
                    updated: Date.now()
                };

                dbo.collection(collectionTodo).insertOne(myobj).then(result2 => {
                    if (err) throw err;
                    db.close();
                    res.redirect('/');

                }).catch(e => {
                    db.close();
                    console.error(e);
            		res.status(500).send()
                });

			} else {
            	res.status(500).send()
			}
		} catch (e){
            console.log(e)
            res.status(500).send()
        }

    });

});


app.get('/del/:id', function (req, res) {

	MongoClient.connect(urlmongo, option, function(err, db) {
        if (err) throw err;
        try {
            var dbo = db.db(dbName);
            var id = req.params.id    
            var find = { _id: new ObjectId(id) };
            var projection = { projection: { _id: 1 } }
            var list = {};

            dbo.collection(collectionTodo).deleteOne(find).then(result2 => {
                if (err) throw err;
                db.close();
                res.redirect('/');

            }).catch(e => {
                db.close();
                console.error(e);
        		res.status(500).send()
            });

		} catch (e){
            console.log(e)
            res.status(500).send()
        }

    });

});


app.get('/check/:id/:state', function (req, res) {

	MongoClient.connect(urlmongo, option, function(err, db) {
        if (err) throw err;
        try {
            var dbo = db.db(dbName);
            var f = req.body.form;
            var id = req.params.id
            var state = req.params.state
            if (state == "true")
            	state = true 
            else 
            	state = false
  
            var find = { _id: new ObjectId(id) };
            var projection = { projection: { _id: 1 } }
            var list = {};

            var myobj = { 
                updated: Date.now(),
                checked: state
            };
            var newvalues = { $set: myobj };

            dbo.collection(collectionTodo).updateOne(find, newvalues).then(result => {
            res.redirect('/');

            }).then(() => {
                db.close();
            }).catch(e => {
                db.close();
                console.error(e);
        		res.status(500).send()

            });

		} catch (e){
            console.log(e)
            res.status(500).send()
        }

    });

});

///////////////////////// DEBUG /////////////////////////
app.get('/db', function (req, res) {

    MongoClient.connect(urlmongo, option, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        var find = {};
        dbo.collection(collectionTodo).find(find).toArray().then(result => {
            res.write(JSON.stringify(result))
            res.end()

        }).then(() => {
            db.close();
        }).catch(e => {
            db.close();
            console.error(e);
        });

    });
});


app.get('/dbclear', function (req, res) {

    MongoClient.connect(urlmongo, option, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        var find = {};
        dbo.collection(collectionTodo).drop()
    });
});

