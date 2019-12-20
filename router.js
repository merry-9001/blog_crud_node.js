var express = require('express')
var User = require('./models/user')
var Student = require('./models/student')
var Publish = require('./models/publish')
var md5 = require('blueimp-md5')

var router = express.Router()

router.get('/', function(req, res) {
    // console.log(req.session.user)

    Student.find(function(err, students) {
        if (err) {
            return res.status(500).send('Server error.')
        }

        Publish.find(function(err, publish) {
            if (err) {
                return res.status(500).send('Server error.')
            }
            res.render('index.html', {
                publish: publish,
                students: students,
                user: req.session.user
            })
        })

    })

})
router.get('/students/new', function(req, res) {
    res.render('topic/new.html')
})
router.post('/students/new', function(req, res) {
    var student = req.body
    new Student(req.body).save(function(err) {
        if (err) {
            return res.status(500).send('Server error.')
        }
        res.redirect('/')
    })
})
router.get('/students/edit', function(req, res) {
    // console.log(req.query.id)
    Student.findById(req.query.id.replace(/"/g, ''), function(err, student) {
        if (err) {
            return res.status(500).send('Server error.')
        }
        // console.log(student)
        res.render('topic/edit.html', {
            student: student
        })
    })
})

router.post('/students/edit', function(req, res) {
    // console.log(req.body.id.replace(/"/g, ''))
    // var id = req.body.id.replace(/"/g, '')
    var id = req.body.id.replace(/"/g, '')
    Student.findByIdAndUpdate(id, req.body, function(err) {
        if (err) {
            // console.log(err)
            return res.status(500).send('Server error.')
        }
        res.redirect('/')
    })
})
router.get('/students/delete', function(req, res) {
    // console.log(req.query.id)
    var id = req.query.id.replace(/"/g, '')
    Student.findByIdAndRemove(id, function(err, student) {
        if (err) {
            console.log(err)
            return res.status(500).send('Server error.')
        }
        // console.log(student)
        res.redirect('/')
    })
})


router.get('/login', function(req, res) {
    res.render('login.html')
})

router.post('/login', function(req, res, next) {
    // 1. 获取表单数据
    // 2. 查询数据库用户名密码是否正确
    // 3. 发送响应数据
    var body = req.body

    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    }, function(err, user) {
        if (err) {
            // return res.status(500).json({
            //   err_code: 500,
            //   message: err.message
            // })
            return next(err)
        }

        // 如果邮箱和密码匹配，则 user 是查询到的用户对象，否则就是 null
        if (!user) {
            return res.status(200).json({
                err_code: 1,
                message: 'Email or password is invalid.'
            })
        }

        // 用户存在，登陆成功，通过 Session 记录登陆状态
        req.session.user = user

        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.get('/register', function(req, res, next) {
    res.render('register.html')
})

router.post('/register', function(req, res, next) {
    // 1. 获取表单提交的数据
    //    req.body
    // 2. 操作数据库
    //    判断改用户是否存在
    //    如果已存在，不允许注册
    //    如果不存在，注册新建用户
    // 3. 发送响应
    var body = req.body
        // console.log(body)
    User.findOne({
        $or: [{
                email: body.email
            },
            {
                nickname: body.nickname
            }
        ]
    }, function(err, data) {
        if (err) {
            return res.status(500).json({
                    err_code: 500,
                    message: '服务端错误'
                })
                // return next(err)
        }
        // console.log(data)
        if (data) {
            // 邮箱或者昵称已存在
            return res.status(200).json({
                    err_code: 1,
                    message: 'Email or nickname aleady exists.'
                })
                // return res.send(`邮箱或者密码已存在，请重试`)
        }

        // 对密码进行 md5 重复加密
        body.password = md5(md5(body.password))

        new User(body).save(function(err, user) {
            if (err) {
                return res.status(500).json({
                    err_code: 500,
                    message: '服务端错误'
                })
            }

            // 注册成功，使用 Session 记录用户的登陆状态
            req.session.user = user

            // Express 提供了一个响应方法：json
            // 该方法接收一个对象作为参数，它会自动帮你把对象转为字符串再发送给浏览器
            res.status(200).json({
                err_code: 0,
                message: 'OK'
            })

            // 服务端重定向只针对同步请求才有效，异步请求无效
            // res.redirect('/')
        })
    })
})

router.get('/logout', function(req, res) {
    // 清除登陆状态
    req.session.user = null

    // 重定向到登录页
    res.redirect('/')
})
router.get('/topic', function(req, res) {
    // console.log(req.query.id)
    Publish.findById(req.query.id.replace(/"/g, ''), function(err, publish) {
        if (err) {
            return res.status(500).send('Server error.')
        }
        // console.log(student)
        res.render('topic/topic.html', {
            publish: publish
        })
    })
})

router.get('/publish', (req, res) => {
    res.render('./topic/publish.html', {
        user: req.session.user
    })
})

router.post('/publish', (req, res) => {
    // console.log(req.body)
    req.body.nickname = req.session.user.nickname
    new Publish(req.body).save((err, data) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                message: '服务端错误'
            })
        }

        res.status(200).json({
            code: 0,
            message: 'ok'
        })
    })

})

module.exports = router