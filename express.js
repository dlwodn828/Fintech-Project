var express = require("express"),
app = express();
var jwt =require("jsonwebtoken");
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.engine('html',require('ejs').renderFile);
app.use(express.json());
app.use(express.urlencoded({extended : false}));
var request = require('request');
var port = process.env.PORT || 8080;
var auth = require("./auth");
app.use(express.static(__dirname + '/public'));

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'dl94585854',
  database : 'fintech'
});
connection.connect();


 


// mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dl94585854';

app.get("/", function(request, response){
    // response.end("Hello!");
    response.render('main');
});

app.get("/authResult", function(req, res){
    var authCode = req.query.code;
    option = {
        url : 'https://testapi.open-platform.or.kr/oauth/2.0/token',
        method : "POST",
        headers : {

        },
        form : {
            code : authCode,
            client_id : "l7xxaec048f3b32f40858f0050a52f36e39f",
            client_secret : "f5a996e713744a2f97ee2bc098a29383",
            redirect_uri : "http://localhost:8080/authResult",
            grant_type : "authorization_code"
        }
    }
    request(option, function (error, response, body) {
        console.log(body);
        if(error){
            console.error(error);
            throw error;
        }
        else{
            var accessTokenObj = JSON.parse(body);
            console.log(accessTokenObj);
            res.render('resultChild',{data:accessTokenObj});
        }
    });
});

app.get("/signup", function(request, response){
    response.render('signup');
});

app.get("/design", function(request, response){
    // response.end("Hello!");
    response.render('design');
});
app.get("/sendUserData", function(request, response){
    var userId = request.query.userId;
    var userPwd = request.query.userPwd;
    console.log(userId, userPwd);
    response.json(1);
    
    if(dbcon(userId,userPwd)==true){
        response.render('design');
        
    }

})

app.get("/sayHello", function(request, response){
    var user_name = request.query.user_name;
    response.end("Hello"+user_name+"!");
});

app.post('/signup', function(req,res){
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    var accessToken = req.body.accessToken;
    var refreshToken = req.body.refreshToken;
    var useseqnum = req.body.useseqnum;
    
    console.log(userEmail,userPassword,accessToken,refreshToken,useseqnum);
    var sql="INSERT INTO user(user_id,user_password,accessToken,refreshToken,userseqnum)"+ 
    "values (?,?,?,?,?)";
    connection.query(sql,[userEmail,
        userPassword,
        accessToken,
        refreshToken,
        useseqnum],function(err,result){
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

app.post('/login', function (req, res) {
    var userEmail = req.body.userId;
    console.log(userEmail);
    var userPassword = req.body.password;
    console.log(userPassword);
    console.log(userEmail, userPassword);
    var sql = "SELECT * FROM user WHERE user_id = ?";
    connection.query(sql, [userEmail], function (error, results) {
    if (error){ 
          throw error;
    }
    else {
        // console.log(results);
        console.log(userPassword, results[0].user_password);
        if(userPassword == results[0].user_password){
            jwt.sign(
                {
                    userName : results[0].name,
                    userId : results[0].user_id
                },
                "12345abcdefff",
                {
                    expiresIn : '1d',
                    issuer : 'fintech.admin',
                    subject : 'user.login.info'
                },
                function(err, token){
                    console.log('로그인 성공', token);
                    res.json(token);
                }
            )            
        }
        else {
            res.json('등록정보가 없습니다');
        }
      }
    });
})

app.get('/login', function(req,res){
    res.render('login');
})

app.get('/main',auth,function(req,res){
    res.render('main');
})

app.listen(port);
console.log("Listeing on port",port);
//jwt 토큰을 이용. session이용 x
//auto_incresement써서 세션 만들면 인스턴스 마다 생성해야하니까 관리가 힘들다.