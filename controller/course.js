// 用到的模块
const http = require('http');
const queryString = require('querystring');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');


// 学校的hostname地址以及端口、请求方式为http请求、请求登录的路径、请求的方法、参数
const hostName = '210.38.137.125';
const port = '8016';
const path = '/default2.aspx';


const getCourseByTeamAndWeek = (data) => {
    // 前端传来的 用户ID, 用户密码, 学期, 周数
    let { grade, userId, userName, team } = data;

    console.log('userId: ' + userId);
    console.log('userName: ' + userName);
    console.log('team: ' + team);
    console.log('grade: ' + grade);

    // 请求课程表要带上的参数
    var postDataTemp = queryString.stringify({
        __EVENTTARGET: 'xnd',
        __EVENTARGUMENT: '',
        __VIEWSTATE: 'dDwxNTM4MTc2MTcwO3Q8O2w8aTwxPjs+O2w8dDw7bDxpPDE+O2k8Mj47aTw0PjtpPDc+O2k8OT47aTwxMT47aTwxMz47aTwxNT47aTwyMj47aTwyNj47aTwyOD47aTwzMD47aTwzND47aTwzNj47aTw0MD47PjtsPHQ8cDxwPGw8VGV4dDs+O2w8MTIwMjAtMjAyMTE7Pj47Pjs7Pjt0PHQ8cDxwPGw8RGF0YVRleHRGaWVsZDtEYXRhVmFsdWVGaWVsZDs+O2w8eG47eG47Pj47Pjt0PGk8ND47QDwyMDE5LTIwMjA7MjAxOC0yMDE5OzIwMTctMjAxODsyMDE2LTIwMTc7PjtAPDIwMTktMjAyMDsyMDE4LTIwMTk7MjAxNy0yMDE4OzIwMTYtMjAxNzs+PjtsPGk8MD47Pj47Oz47dDx0PDs7bDxpPDE+Oz4+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w85a2m5Y+377yaMjAxNjExNjEyNDI2Oz4+Oz47Oz47dDxwPHA8bDxUZXh0Oz47bDzlp5PlkI3vvJrorrjms73osao7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPOWtpumZou+8mueUteWtkOS4juS/oeaBr+W3peeoi+WtpumZojs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w85LiT5Lia77ya6YCa5L+h5bel56iLOz4+Oz47Oz47dDxwPHA8bDxUZXh0Oz47bDzooYzmlL/nj63vvJrpgJrkv6ExMTY0Oz4+Oz47Oz47dDw7bDxpPDE+O2k8Mz47PjtsPHQ8O2w8aTwwPjs+O2w8dDw7bDxpPDA+Oz47bDx0PEAwPDs7Ozs7Ozs7Ozs+Ozs+Oz4+Oz4+O3Q8O2w8aTwwPjs+O2w8dDw7bDxpPDA+Oz47bDx0PEAwPDs7Ozs7Ozs7Ozs+Ozs+Oz4+Oz4+Oz4+O3Q8O2w8aTwxPjs+O2w8dDxAMDw7Ozs7Ozs7Ozs7Pjs7Pjs+Pjt0PHA8bDxWaXNpYmxlOz47bDxvPGY+Oz4+O2w8aTwxPjs+O2w8dDxAMDw7Ozs7Ozs7Ozs7Pjs7Pjs+Pjt0PEAwPHA8cDxsPFBhZ2VDb3VudDtfIUl0ZW1Db3VudDtfIURhdGFTb3VyY2VJdGVtQ291bnQ7RGF0YUtleXM7PjtsPGk8MT47aTwwPjtpPDA+O2w8Pjs+Pjs+Ozs7Ozs7Ozs7Oz47Oz47dDw7bDxpPDA+Oz47bDx0PDtsPGk8MD47PjtsPHQ8QDA8cDxwPGw8UGFnZUNvdW50O18hSXRlbUNvdW50O18hRGF0YVNvdXJjZUl0ZW1Db3VudDtEYXRhS2V5czs+O2w8aTwxPjtpPDI+O2k8Mj47bDw+Oz4+Oz47Ozs7Ozs7Ozs7PjtsPGk8MD47PjtsPHQ8O2w8aTwxPjtpPDI+Oz47bDx0PDtsPGk8MD47aTwxPjtpPDI+O2k8Mz47aTw0PjtpPDU+O2k8Nj47PjtsPHQ8cDxwPGw8VGV4dDs+O2w85q+V5Lia5a6e5LmgOz4+Oz47Oz47dDxwPHA8bDxUZXh0Oz47bDzmnLHlj4jmlY87Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPDQuMDs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w8MDEtMDQ7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPCZuYnNwXDs7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPCZuYnNwXDs7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPOS4jeaOkuivvjs+Pjs+Ozs+Oz4+O3Q8O2w8aTwwPjtpPDE+O2k8Mj47aTwzPjtpPDQ+O2k8NT47aTw2Pjs+O2w8dDxwPHA8bDxUZXh0Oz47bDzmr5XkuJrorr7orqE7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPOiCluengOaYpTs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w8MTAuMDs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w8MDUtMTQ7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPCZuYnNwXDs7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPCZuYnNwXDs7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPOS4jeaOkuivvjs+Pjs+Ozs+Oz4+Oz4+Oz4+Oz4+Oz4+O3Q8QDA8cDxwPGw8UGFnZUNvdW50O18hSXRlbUNvdW50O18hRGF0YVNvdXJjZUl0ZW1Db3VudDtEYXRhS2V5czs+O2w8aTwxPjtpPDA+O2k8MD47bDw+Oz4+Oz47Ozs7Ozs7Ozs7Pjs7Pjt0PDtsPGk8MD47PjtsPHQ8O2w8aTwwPjs+O2w8dDxAMDxwPHA8bDxQYWdlQ291bnQ7XyFJdGVtQ291bnQ7XyFEYXRhU291cmNlSXRlbUNvdW50O0RhdGFLZXlzOz47bDxpPDE+O2k8Mj47aTwyPjtsPD47Pj47Pjs7Ozs7Ozs7Ozs+O2w8aTwwPjs+O2w8dDw7bDxpPDE+O2k8Mj47PjtsPHQ8O2w8aTwwPjtpPDE+O2k8Mj47aTwzPjtpPDQ+Oz47bDx0PHA8cDxsPFRleHQ7PjtsPDIwMTktMjAyMDs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w8Mjs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w85q+V5Lia5a6e5LmgOz4+Oz47Oz47dDxwPHA8bDxUZXh0Oz47bDzmnLHlj4jmlY87Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPDQuMDs+Pjs+Ozs+Oz4+O3Q8O2w8aTwwPjtpPDE+O2k8Mj47aTwzPjtpPDQ+Oz47bDx0PHA8cDxsPFRleHQ7PjtsPDIwMTktMjAyMDs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w8Mjs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w85q+V5Lia6K6+6K6hOz4+Oz47Oz47dDxwPHA8bDxUZXh0Oz47bDzogpbnp4DmmKU7Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPDEwLjA7Pj47Pjs7Pjs+Pjs+Pjs+Pjs+Pjs+Pjs+Pjs+Pjs+89k4KkFpUQSNNbMTy4ZYfDNzplc=',
        xnd: '2019-2020',
        xqd: '1'
    });
    // console.log(postDataTemp);

    // 请求的选项, 包括主机名, 端口, 路径, 请求头
    const optionsTemp = {
        hostname: hostName,
        method: 'POST',
        port: port,
        path: '/xskbcx.aspx?xh=201611612426&xm=%D0%ED%D4%F3%BA%C0&gnmkdm=N121602',
        //头文件的配置
        headers: {
            'Content-Length': Buffer.byteLength(postDataTemp),
            'Accept': 'text/html,charset=GB2312',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'ASP.NET_SessionId=f12bdu45a511gj55r353ur45',
            'Referer': 'http://210.38.137.125:8016/xskbcx.aspx?xh=201611612426&xm=%D0%ED%D4%F3%BA%C0&gnmkdm=N121602'
        }
    }

    return new Promise((resolve, reject) => {
        // 正式发起请求
        const req1 = http.request(optionsTemp, res => {
            var chunks = [];
            res.on('data', chunk => {
                chunks.push(chunk);
            })
            res.on('end', () => {
                // 解决系统老旧带来的乱码问题, 由iconv模块进行编码处理
                var decodeBody = iconv.decode(Buffer.concat(chunks), 'gb2312');
                var $ = cheerio.load(decodeBody, { decodeEntities: false });
                var tr = $('#Table1 tr');

                var courseList = new Array();

                tr.each((index, item) => {
                    // 获取每一大节 共五节 (每一行, 这里只获取偶数行)
                    if (index != 0 && index % 2 === 0) {
                        var td = $(item).html();
                        var tdLen = $(td).length;
                        var courseTdArr = [];

                        // 从后往前获取每一天的每一大节 共七天 (每一列)
                        for (var i = 0; i < 7; i++) {
                            courseTdArr.push($(td).eq(tdLen - 2 - i).html());
                        }

                        // 反转数组
                        courseTdArr.reverse();
                        for (var i = 0; i < 7; i++) {
                            var courses = handleCourseData(courseTdArr[i]);
                            courseList.push(courses)
                        }
                    }
                })
                var data = JSON.stringify({
                    courseList
                })
                resolve(data);
            })
        })
        req1.write(postDataTemp);
        req1.end();
    })
}



// 处理课程表数据
const handleCourseData = function(courseTdArr) {

    // 每一块课程可能不止一门课, 这里用一个数组保存多门课
    var courses = new Array();

    // 如果传过来的<td></td>是有数据的
    if (courseTdArr.includes('<br>')) {

        //分割 <td>的正则表达式, 去掉<br>,留下纯正的字符串, 
        var splitReg = /<br><br>|<br>/;
        var courseItem = courseTdArr.split(splitReg);

        // for (var i = 0; i < courseItem.length / 4; i++) {
        var obj = {
            courseName: courseItem[0],
            courseTimeStart: changeWeekToNum(courseItem[1]).courseTimeStart,
            courseTimeEnd: changeWeekToNum(courseItem[1]).courseTimeEnd,
            courseWeek: changeWeekToNum(courseItem[1]).courseWeek,
            courseWeekNum: changeWeekToNum(courseItem[1]).courseWeekNum,
            courseSectionStart: changeSectionToNum(courseItem[1]).courseSectionStart,
            courseSectionEnd: changeSectionToNum(courseItem[1]).courseSectionEnd,
            courseTea: courseItem[2],
            courseRoom: courseItem[3],
            broderCourse: {
                courseName: courseItem[4] || "",
                courseTimeStart: changeWeekToNum(courseItem[5]).courseTimeStart || "",
                courseTimeEnd: changeWeekToNum(courseItem[5]).courseTimeEnd || "",
                courseWeek: changeWeekToNum(courseItem[5]).courseWeek || "",
                courseWeekNum: changeWeekToNum(courseItem[5]).courseWeekNum || "",
                courseSectionStart: changeSectionToNum(courseItem[5]).courseSectionStart || "",
                courseSectionEnd: changeSectionToNum(courseItem[5]).courseSectionEnd || "",
                courseTea: courseItem[6] || "",
                courseRoom: courseItem[7] || "",
            }
        }
    } else {
        return {};
    }
    return obj;
}


// 将周数 相关转换为 数字(包括其实上课周, 星期几)
const changeWeekToNum = function(courseTime) {
    if (courseTime !== undefined) {
        var courseWeek = courseTime.slice(0, 2);
        var courseWeekMatch = {
            "周一": 1,
            "周二": 2,
            "周三": 3,
            "周四": 4,
            "周五": 5,
            "周六": 6,
            "周日": 7,
        }

        var courseWeekNum = courseWeekMatch[courseWeek].toString();

        // 匹配 1-8, 11-16 的正则表达式
        var reg = /[1-9]{1,2}-[0-9]{1,2}/;
        var courseTimeDuration = courseTime.match(reg).toString();

        //以 - 进行分割, 取出两个数字
        var courseTimeStart = courseTimeDuration.split('-')[0];
        var courseTimeEnd = courseTimeDuration.split('-')[1];
    }
    return { courseTimeStart, courseTimeEnd, courseWeekNum, courseWeek };
}


// 第几节上课转为数字
const changeSectionToNum = function(courseTime) {
    // 周一第3,4节{第1-6周}
    if (courseTime !== undefined) {
        var sectionReg = /[1-9],[0-9]{1,2}/;
        var courseSectionDuration = courseTime.match(sectionReg).toString();
        var courseSectionStart = courseSectionDuration.split(',')[0];
        var courseSectionEnd = courseSectionDuration.split(',')[1];
    }
    return { courseSectionStart, courseSectionEnd };
}



// 签到成功
exports.signInSuccess = (req, res) => {
    console.log(req.body);
    res.send('签到成功');
}




// 课程报错
exports.courseErrReport = (req, res) => {
    let { courseName, courseRoom, courseTea, section, timeStart, timeEnd } = req.body;

    console.log(req.body);

    res.send('报告错误成功');
}






exports.getCource = (req, res) => {
    getCourseByTeamAndWeek(req.body).then(data => {
        res.send(data);
    }).catch(err => {
        console.log(err);
    })
}