var express = require("express"),
app = express();
var jwt =require("jsonwebtoken");
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.engine('html',require('ejs').renderFile);
app.use(express.json());
app.use(express.urlencoded({exRtended : false}));
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
    console.log("111");
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

app.get('/qrcode', function(req,res){
    res.render('qrcode');
})

app.get('/qr', function(req,res){
    res.render('qrcodeReader');
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
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    console.log(1);
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
            // 토큰 생성
            jwt.sign(
                {   
                    //토큰에 다른 데이터도 추가할 수 있음.
                    id : results[0].id,
                    user_id : results[0].user_id,
                    accessToken : results[0].accessToken
                },
                "12345abcdefff",
                {
                    expiresIn : '1d', //토큰이 1day짜리.
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

app.post("/getUser",auth,function(req,res){ // auth를 넣으면 토큰이 있는지를 확인
    
    // console.log(req.decoded);
    console.log(req.decoded);
    var selectUserSql = "select * from user where id = ?";
    var userseqnum = "";
    var userAccessToken = "";
    connection.query(selectUserSql, [req.decoded.id], function(err, result){
        if(err){
            console.log(err);
            throw err;
        }else{
            console.log(result);
            userseqnum = result[0].userseqnum;
            userAccessToken = result[0].accessToken;
            console.log(userseqnum,userAccessToken);
            //비동기라서 먼저끝나는것부터 처리됌. 그래서 else문 안으로 옮김
            // async, await, promise 등으로도 해결 가능.
            var qs = '?user_seq_no=' + userseqnum;

            option = {
                url : 'https://testapi.open-platform.or.kr/user/me'+qs,
                method : "GET",
                headers : {
                    Authorization : 'Bearer '+userAccessToken
                }
            }
            // "/balance"주소로 post방식으로 요청이 들어오면 testapi서버에 또다시 형식에 맞춘 요청을 날려 내가 원하는 값들을 받아온다.
            //postman으로 post 날려서 테스트. 브라우저에서는 get밖에 못함.
            request(option, function (error, response, body) {
                console.log(body); // 계좌 내용 다 찍힘
                if(error){
                    console.error(error);
                    throw error;
                }
                else{
                    // res.json(1);
                    // res.json(body); 이렇게하면 에러남. 파싱문제
                    var resObj = JSON.parse(body);
                    res.json(resObj);
                }
            });
        }
    })

    
})

app.post('/balance',function(req,res){
    var finusenum = req.body.finNum;
    var selectUserSql = "SELECT * FROM fintech.user WHERE user_id = ?";
    connection.query(selectUserSql,[req.decoded.user_id], function(err, result){
        var accessToken = result[0].accessToken;
        var qs = "?fintech_use_num="+finusenum+"&tran_dtime=20190918170159"
        option = {
            url : "https://testapi.open-platform.or.kr/v1.0/account/balance"+qs,
            method : "GET",
            headers : {
                Authorization : "Bearer " + accessToken
            },
        }
        request(option, function (error, response, body) {
            // console.log(body);
            if(error){
                console.error(error);
                throw error;
            }
            else {
                console.log(body);
                var resultObj = JSON.parse(body);
                res.json(resultObj);
            }
        });
    })
 });



app.get('/main',function(req,res){
    res.render('main');
})

app.get('/balance',function(req,res){
    res.render('balance');
})

app.post('/transaction',auth,function(req,res){

    var selectUserSql = "select * from user where user_id = ?";
    var finusenum = req.body.finNum;
    connection.query(selectUserSql, [req.decoded.user_id], function(err, result){
        if(err){
            console.log(err);
            throw err;
        }else{
            console.log(result);

            var userAccessToken = result[0].accessToken;
            // console.log(userseqnum,userAccessToken);
            var qs = "?fintech_use_num=" + finusenum
            +"&inquiry_type=A"
            +"&from_date=20190101"
            +"&to_date=20190101"
            +"&sort_order=D"
            +"&page_index=1"
            +"&tran_dtime=20190918170159";

            option = {
                url : "https://testapi.open-platform.or.kr/v1.0/account/transaction_list"+qs,
                method : "GET",
                headers : {
                    Authorization : "Bearer "+userAccessToken
                }
            }
            // "/balance"주소로 post방식으로 요청이 들어오면 testapi서버에 또다시 형식에 맞춘 요청을 날려 내가 원하는 값들을 받아온다.
            //postman으로 post 날려서 테스트. 브라우저에서는 get밖에 못함.
            request(option, function (error, response, body) {
                console.log(body); // 계좌 내용 다 찍힘
                if(error){
                    console.error(error);
                    throw error;
                }
                else{
                    // res.json(1);
                    // res.json(body); 이렇게하면 에러남. 파싱문제
                    var resObj = JSON.parse(body);
                    console.log("해결!!!");
                    res.json(resObj);
                }
            });
        }
    })
})

app.post('/withdrawQR',auth,function(req,res){
    var selectUserSql = "select * from user where user_id = ?";
    console.log(req.decoded);
    var finusenum = req.body.qrFin;
    console.log("핀유즈넘:",finusenum);
    connection.query(selectUserSql, [req.decoded.user_id], function(err, result){
        if(err){
            console.log(err);
            throw err;
        }else{
            console.log(result[0]);

            var userAccessToken = result[0].accessToken;

            option = {
                url : "https://testapi.open-platform.or.kr/v1.0/transfer/withdraw",
                method : "POST",
                headers : {
                    Authorization : "Bearer "+userAccessToken,
                    "Content-Type" : "application/json; charset=UTF-8"
                },
                json:{
                    "dps_print_content" : "쇼핑몰",
                    "fintech_use_num" : finusenum,//"199004697057725522315571",
                    "tran_amt" : "10000",
                    "tran_dtime" : "20190918170159"
                 }
            }
            // "/balance"주소로 post방식으로 요청이 들어오면 testapi서버에 또다시 형식에 맞춘 요청을 날려 내가 원하는 값들을 받아온다.
            //postman으로 post 날려서 테스트. 브라우저에서는 get밖에 못함.
            request(option, function (error, response, body) {
                // console.log(body); // 계좌 내용 다 찍힘
                if(error){
                    console.error(error);
                    throw error;
                }
                else{
                    // res.json(1);
                    // res.json(body); 이렇게하면 에러남. 파싱문제
                    var resObj = body;
                    console.log("resObj",resObj);
                    if(resObj.rsp_code == "A0002" || resObj.rsp_code == "A0000"){
                        res.json(1);
                        // console.log("해결!!!");
                        // res.json(resObj);
                    }else if(resObj.rsp_code=="A0005"){
                        res.json(2);
                    }else{
                        res.json(3);
                    }
                    // console.log(resObj);
                }
            });
        }
    })
})


//npm install nodemon -g 자동 재시작
//npm i morgan
app.get("/deposit", function(req,res){
    res.render('deposit');
})
app.get('/kakao', function(req,res){
    option={

    }
});
app.post("/deposit", function(req, res){
    option = {
        url : 'https://testapi.open-platform.or.kr/oauth/2.0/token',
        method : "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        form : {
            client_id : "l7xxaec048f3b32f40858f0050a52f36e39f",
            client_secret : "f5a996e713744a2f97ee2bc098a29383",
            scope : "oob",
            grant_type : "client_credentials"
        }
    }
    request(option, function (error, response, body) {
        console.log(body);
        if(error){
            console.error(error);
            throw error;
        }
        else{
            var accessToken = JSON.parse(body);
            console.log("토큰",accessToken.access_token);


            var account = req.body.account;
            var amount = req.body.amount;

            option = {
                url : "https://testapi.open-platform.or.kr/v1.0/transfer/deposit",
                method : "POST",
                headers : {
                    Authorization : "Bearer "+accessToken.access_token,
                    "Content-Type" : "application/json; charset=UTF-8"
                },
                json:{
                    "wd_pass_phrase" : "NONE",
                    "wd_print_content" : "환불금액",
                    "name_check_option" : "off",
                    "req_cnt" : "1",
                    "req_list" : [
                        {
                            "tran_no" : "1",
                            "fintech_use_num" : "199004697057725522315571",//DB에 있는 값을 가져와서 넣으면 된다.
                            "print_content" : "쇼핑몰환불",
                            "tran_amt" : "10000"
                        }
                    ],
                    "tran_dtime" : "20190918170159"
                    }
            }
            // "/balance"주소로 post방식으로 요청이 들어오면 testapi서버에 또다시 형식에 맞춘 요청을 날려 내가 원하는 값들을 받아온다.
            //postman으로 post 날려서 테스트. 브라우저에서는 get밖에 못함.
            request(option, function (error, response, body) {
                // console.log(body); // 계좌 내용 다 찍힘
                if(error){
                    console.error(error);
                    throw error;
                }
                else{
                    var resObj = body;
                    console.log("resObj",resObj);
                    if(resObj.rsp_code == "A0002" || resObj.rsp_code == "A0000"){
                        res.json(1);
                        // console.log("해결!!!");
                        // res.json(resObj);
                    }else if(resObj.rsp_code=="A0005"){
                        res.json(2);
                    }else{
                        res.json(3);
                    }
                    // console.log(resObj);
                }
            });
        }
    });
});

app.post("/deposit2", function(req, res){
    option = {
        url : 'https://testapi.open-platform.or.kr/oauth/2.0/token',
        method : "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        form : {
            client_id : "l7xxaec048f3b32f40858f0050a52f36e39f",
            client_secret : "f5a996e713744a2f97ee2bc098a29383",
            scope : "oob",
            grant_type : "client_credentials"
        }
    }
    request(option, function (error, response, body) {
        console.log(body);
        if(error){
            console.error(error);
            throw error;
        }
        else{
            var accessToken = JSON.parse(body);
            console.log("토큰",accessToken.access_token);


            var account = req.body.account;
            var amount = req.body.amount;
            var depName = req.body.depName;

            
            option = {
                url : "https://testapi.open-platform.or.kr/v1.0/transfer/deposit",
                method : "POST",
                headers : {
                    Authorization : "Bearer "+accessToken.access_token,
                    "Content-Type" : "application/json; charset=UTF-8"
                },
                json:{
                    "wd_pass_phrase" : "NONE",
                    "wd_print_content" : "환불금액",
                    "name_check_option" : "off",
                    "req_cnt" : "1",
                    "req_list" : [
                        {
                            "tran_no" : "1",
                            "bank_code_std" : "097",
                            "account_holder_name" : depName,
                            "account_num" : account,//DB에 있는 값을 가져와서 넣으면 된다.
                            "print_content" : "쇼핑몰환불",
                            "tran_amt" : amount
                        }
                    ],
                    "tran_dtime" : "20190918170159"
                    }
            }
            // "/balance"주소로 post방식으로 요청이 들어오면 testapi서버에 또다시 형식에 맞춘 요청을 날려 내가 원하는 값들을 받아온다.
            //postman으로 post 날려서 테스트. 브라우저에서는 get밖에 못함.
            request(option, function (error, response, body) {
                // console.log(body); // 계좌 내용 다 찍힘
                if(error){
                    console.error(error);
                    throw error;
                }
                else{
                    var resObj = body;
                    console.log("resObj",resObj);
                    if(resObj.rsp_code == "A0002" || resObj.rsp_code == "A0000"){
                        res.json(1);
                        // console.log("해결!!!");
                        // res.json(resObj);
                    }else if(resObj.rsp_code=="A0005"){
                        res.json(2);
                    }else{
                        res.json(3);
                    }
                    // console.log(resObj);
                }
            });
        }
    });
});
app.listen(port);
console.log("Listeing on port",port);
//jwt 토큰을 이용. session이용 x
//auto_incresement써서 세션 만들면 인스턴스 마다 생성해야하니까 관리가 힘들다.