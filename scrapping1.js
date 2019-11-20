const axios = require("axios");
const request = require("request");
const cheerio = require("cheerio");
const log = console.log;
const getHtml = async () => {
   try {
       return await axios.get("https://finance.naver.com/marketindex");
   } catch (error) {
       console.error(error);
   }
};
function getData() {
   request("https://finance.naver.com/marketindex/exchangeDailyQuote.nhn?marketindexCd=FX_CHFKRW&page=1", function (err, res, body) {
       // console.log(body);
       const $ = cheerio.load(body);
       // console.log($(".tbl_exchange tbody").html());
       const bodyList = $(".tbl_exchange tbody tr").map(function (i, element) {
           console.log($(element).find('td:nth-of-type(1)').text());
           console.log($(element).find('td:nth-of-type(4)').text());
           // date_stock : $(element).find('td:nth-of-type(1)').text();
           // value : $(element).find('td:nth-of-type(2)').text();
       })
   })
}
getData();