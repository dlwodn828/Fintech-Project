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