const login = require('../controller/login');
const course = require('../controller/course');

/* GET home page. */
module.exports = app => {
    app.get('/login/getCodeImg', login.getCodeImg);
    app.get('/login/getCookie', login.getCookie);
    app.post('/login/loginMain', login.loginMain);

    app.post('/course/getCource', course.getCource);
    app.post('/course/signInSuccess', course.signInSuccess);
    app.post('/course/courseErrReport', course.courseErrReport);
};