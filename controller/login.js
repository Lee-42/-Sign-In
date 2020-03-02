// 用到的模块
const http = require('http');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const querystring = require('querystring');

// 学校的hostname地址以及端口、请求方式为http请求、请求登录的路径、请求的方法、参数
const hostName = '210.38.137.125';
const port = '8016';
const path = '/default2.aspx';


let cookieFromWeChat = "";
let ViewState = "";

//获取cookie 和 __VIEWSTATE
const getCookiePro = () => {
    var postDataTemp = ``;
    const optionsTemp = {
        hostname: hostName,
        method: 'POST',
        port: port,
        path: path,
        //头文件的配置
        headers: {
            'Content-Length': Buffer.byteLength(postDataTemp),
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }
    return new Promise((resolve, reject) => {
        const req1 = http.request(optionsTemp, res => {
            res.setEncoding('utf-8');
            var chunks = "";
            var cookie = res.headers['set-cookie'][0].split(';')[0];
            var viewState = '';
            res.on('data', chunk => {
                chunks = iconv.decode(chunk, 'gb2312');
                var $ = cheerio.load(chunks, { decodeEntities: false });
                viewState = $('input').val();
            })
            res.on('end', () => {
                resolve({ cookie, viewState });
            })
        })
        req1.write(postDataTemp);
        req1.end();
    })
}


/**
 *根据cookie获取对应可用的验证码图片 
 */
const getBase64CodeImg = () => {
    console.log(cookieFromWeChat);
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: 'http://210.38.137.125:8016/CheckCode.aspx',
            encoding: null,
            headers: {
                // 'ASP.NET_SessionId=f12bdu45a511gj55r353ur45'
                'Cookie': cookieFromWeChat,
            }
        }, (err, res, body) => {
            // 进行base64编码 
            var buf = iconv.decode(body, 'base64');
            resolve(buf);
        })
    })
}



/**
 * 获取登录跳转到主页面的重定向地址
 * @param {前端传来的登录信息*} data 
 */
const getLocation = (data) => {
    var __VIEWSTATE = querystring.stringify({ __VIEWSTATE: ViewState });
    console.log("这是: " + __VIEWSTATE);
    console.log(data)

    var postDataTemp = `${__VIEWSTATE}&txtUserName=${data.txtUserName}&Textbox1=&TextBox2=${data.TextBox2}&txtSecretCode=${data.txtSecretCode}&RadioButtonList1=%D1%A7%C9%FA&Button1=&lbLanguage=&hidPdrs=&hidsc=`;
    // console.log(postDataTemp);
    const optionsTemp = {
            hostname: hostName,
            method: 'POST',
            port: port,
            path: path,
            //头文件的配置
            headers: {
                'Content-Length': Buffer.byteLength(postDataTemp),
                'Content-Type': 'application/x-www-form-urlencoded',
                // 'ASP.NET_SessionId=f12bdu45a511gj55r353ur45'
                'Cookie': cookieFromWeChat,
            }
        }
        console.log(optionsTemp);

    return new Promise((resolve, reject) => {
        const req1 = http.request(optionsTemp, res => {
            res.setEncoding('utf-8');
            console.log(res.headers.location);
            resolve(res.headers.location);

        })
        req1.write(postDataTemp);
        req1.end();
    })
}



/**
 * 登录主页面
 */
const loginMainPage = (mainUrl) => {
    let mainPageUrl = `http://210.38.137.125:8016${mainUrl}`;

    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: mainPageUrl,
            encoding: null,
            headers: {
                'Content-Type': 'text/html; charset=gb2312',
                'Cookie': cookieFromWeChat,
            }
        }, (err, res, body) => {
            var html = iconv.decode(body, 'gb2312');
            var $ = cheerio.load(html);
            var userName = $('#xhxm').text();
            resolve(userName);
        })
    })
}



// 获取cookie 和 __VIEWSTAT接口
exports.getCookie = (req, res) => {
    getCookiePro().then(data => {
        // res.write(cookie);
        console.log("cookie: " + data.cookie + " " + "viewState: " + data.viewState);
        cookieFromWeChat = data.cookie;
        ViewState = data.viewState;
        res.send(data);
    })
}

// 获取验证码图片接口
exports.getCodeImg = (req, res) => {
    console.log('cookieFromWeChat: '+cookieFromWeChat);
    getBase64CodeImg().then(buf => {
        res.send(buf);
    })
}

// 登录接口
exports.loginMain = (req, res) => {
    const data = req.body;
    // TextBox2: "jmqs18666"
    // txtSecretCode: "06u1"
    // txtUserName: "201611612426"
    // userType: "%D1%A7%C9%FA"

    // getCookiePro().then(cookieAndViewState => {
        // var cookie = cookieAndViewState.cookie;
        // var cookie = cookieFromWeChat;
        // var viewState = cookieAndViewState.viewState;
        // var viewState = ViewState;
        // data.viewState = viewState;
        getLocation(data).then(location => {
                return loginMainPage(location);
            })
            .then(username => {
                username = username.slice(0, 3);
                res.send(username);
                console.log('欢迎你:' + username);
            })
    // })
}