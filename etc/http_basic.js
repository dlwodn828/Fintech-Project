var http = require("http");
http.createServer(function(req,res){
    var body = "hello server";
    console.log("hihi");
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("안녕하세요");
}).listen(3000);