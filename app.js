var express = require('express')
var path = require('path')
var bodyParser = require('body-parser');
var app = express()
var session = require('express-session')
var router = require('./router')
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views/')) // 默认就是 ./views 目录

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use(router)
app.use(function(req, res) {
    res.render('404.html')
})
app.listen(5000, function() {
    console.log('running...')
})