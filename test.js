var express = require("express"),
app = express();

app.set('views', __dirname+'/views');
app.use(express.json());
app.use(express.urlencoded({extended : false}));
var request = require('request');
var port = process.env.PORT || 8080;


app.use(express.static(__dirname + '/public'));

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'dl94585854',
  database : 'test'
});
connection.connect();

app.post('/create', function(req,res){
    var content = req.body.content;
    var sql="Insert into test(content)" + "values(?)";
    connection.query(sql,[content],function(err,result){
        if(err){
            console.error(err);
            throw err;
        }
        else{
            res.json(1);
        }
    })
    // connection.end();
})

app.post('/read',function(req,res){
    var sql = "select * from test";
    connection.query(sql,function(err,result){
        if(err){
            console.err(err);
            throw err;
        }else{
            res.json(result);
        }
    })
})

app.post('/update',function(req,res){
    var id = req.body.id;
    var content = req.body.content;
    var sql = "update test set content = ? where id= ?";
    connection.query(sql,[content,id], function(err,result){
        if(err){
            console.err(err);
            throw err;
        }else{
            res.json(1);
        }
    })
})

app.post('/delete',function(req,res){
    var id = req.body.id;
    var sql = "delete from test where id= ?";
    connection.query(sql,[id], function(err,result){
        if(err){
            console.err(err);
            throw err;
        }else{
            res.json(1);
        }
    })
})