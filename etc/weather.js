// import { request } from "http";
// import { callbackify } from "util";

var xml2js = require('xml2js');
var request = require('request');
var parser = new xml2js.Parser();
// var parseString = require('xml2js').parseString;
// var xml = "<root>Hello xml2js!</root>"
// parseString(xml, function (err, result) {
//     console.dir(result);
// });


request('http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnld=109', function(error, response, body){
    parser.parseString(body,function(err,jsonData){
        // console.log(body);
        // console.log(jsonData);
        console.log(jsonData.rss.channel[0].item[0].description[0].header[0].wf[0]);

    })
});

