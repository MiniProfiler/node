var miniprofiler = require('../../miniprofiler.js')
var pg = require('pg')

var express = require('express')
var connString = 'postgres://postgres:postgres@localhost/async_demo'

var app = express()
app.use(miniprofiler.profile())
app.use(miniprofiler.for.pg(pg))

app.set('view engine', 'pug')
app.set('views', './examples/views')

app.get('/', function (req, res) {
	res.render('home')
})

app.get('/multi-query', function (req, res) {
	pg.connect(connString, function (err, client, done) {
	  client.query('SELECT pg_sleep(1)', [], function (err, result) {
	    client.query('SELECT $1::int AS number', ['2'], function (err, result) {
	      console.log(result)
	      done()
	      res.render('multi-query')
		  })
	  })
	})
})

app.listen(8080)
