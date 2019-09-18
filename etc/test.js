var length =16;
var lastName = "John";
var x = {firstName : "John", lastName:"Doe"};
var x = 16 + "Volvo";
console.log(x);

var cars =[];
var car1 = {
    name : "sonata",
    hp:"00",
    start : function(){
        console.log("car1 start");
    },
    stop : function(){
        console.log("car1 end");
    }
}
var car2 = {
    name : "grandure",
    hp:"01",
    start : function(){
        console.log("car2 start");
    },
    stop : function(){
        console.log("car2 end");
    }
}
cars[0]=car1;
cars[1]=car2;
console.log(cars[0].name);
cars[1].start();


var fs = require('fs');
console.log('1');
fs.readFile('test.txt', 'utf8', function(err,result){
    if(err){
        console.error(err);
        throw err;
    }
    else{
        console.error("2");
        console.log(result);
    }
});
console.log('3');


var fs = require('fs');
console.log('a');
var result = fs.readFileSync('test.txt','utf8'); 
console.log(result);
console.log('c');
console.log('=======');




function callbackFunc(callback){
    fs.readFile('test.txt', 'utf8', function(err,result){
        if(err){
            console.error(err);
            throw err;
        }
        else{
            console.error("2");
            callback(result);
        }
    });
}

console.log('A');
callbackFunc(function(data){
    console.log(data);
    console.log("c");
});

var http = require("http");
http.createServer(function(req,res){
    var body = "hello server";
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("안녕하세요");
}).listen(3000);