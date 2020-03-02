var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var querystring = require('querystring');


var __VIEWSTARE = '';

http.get('http://210.38.137.125:8016/default2.aspx', function(res) {
    var html = '';
    res.on('data', function(data) {
        var buf = iconv.decode(data, 'gb2312');
        html += buf;
        // html是登录页面的代码
        // console.log(html);
    });
    res.on('end', function() {
        var $ = cheerio.load(html);
        __VIEWSTARE = $('input').val();
        __VIEWSTARE = querystring.stringify({ __VIEWSTARE: __VIEWSTARE });
        console.log(__VIEWSTARE);

        // 登录需要post的数据
        var postData = `${__VIEWSTARE}&txtUserName=201611612426&Textbox1=&TextBox2=jmqs18666&txtSecretCode=gbg2&RadioButtonList1=%D1%A7%C9%FA&Button1=&lbLanguage=&hidPdrs=&hidsc=`
        console.log(postData);
        //登录需要参数
        var options = {
            hostname: '210.38.137.125',
            port: 8016,
            path: '/default2.aspx',
            method: 'POST',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Content-Length': postData.length,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': res.headers['set-cookie'],
                'Host': '210.38.137.125:8016',
                'Origin': 'http://210.38.137.125:8016',
                'Referer': 'http://210.38.137.125:8016/default2.aspx',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
            }
        }

        var req = http.request(options, function(res) {
            var data = [];
            res.on('data', function(chunk) {
                data.push(chunk);
            });
            res.on('end', function() {
                var html = iconv.decode(Buffer.concat(data), 'gb2312');
                var $ = cheerio.load(html, { decodeEntities: false });
                console.log(res.headers.location);
            })
        });
        req.write(postData);
        req.end();
    })
})