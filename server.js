const sqlite3 = require('sqlite3').verbose()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var multer = require('multer')

const db = new sqlite3.Database('db.sqlite3')

db.serialize( () => {
	// инфо по событиям
	db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, altname TEXT NOT NULL, name TEXT NOT NULL , price INTEGER NOT NULL, image TEXT NOT NULL)")
})


app.use(express.static('www'));
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded











// добавление товара
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './www/images')
	},
	filename: function (req, file, callback) {
		let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
		console.log(ext)
		callback(null, Date.now() + ext)
	}
})
var upload = multer({ storage : storage}).single('itemimage');


//
app.post('/api/put', function (req, res) {

	upload(req, res, function(err) {
		if(err) {
			return res.send("Ошибка загрузки картинки <a href='/registration.html'>Добавить ещё</a>")
		}

		db.run("INSERT INTO items (name, altname, price, image) VALUES (?, ?, ?, ?) ", req.body.name, req.body.name.toUpperCase(), req.body.price, req.file.filename, function (error, result) {
			res.send("Добавлен <a href='/registration.html'>Добавить ещё</a>")
		})
	})
	
})
//



app.post('/api/get', function (req, res) {

	//req.body.sort
	let srt = req.body.sort
	let fnd = req.body.find
	let lcl = req.body.lucky
	let sql = ""
	if (lcl == ''){
		sql = " SELECT * FROM items " 
		+ (fnd != '' ? "WHERE altname LIKE '%"+fnd.toUpperCase()+"%' " : '')
		+ (srt == 'time' ? '' : ' ORDER BY price ' + (srt == 'in' ? 'ASC' : 'DESC'))
	}
	else{
		sql = " SELECT * FROM items WHERE price <= " + lcl + " ORDER BY price "
	}

	console.log(sql)
	//console.log("SELECT * FROM items" + (srt == 'time' ? '' : ' ORDER BY price ' + (srt == 'in' ? 'ASC' : 'DESC')))
	let json = []

	db.each(sql, (e, r) => {

		if(typeof r === undefined) return
			json.push(r)

	}, (err, count) => {
		if (err) 
			console.log(err)
		else{
			res.json(json)
		}
	})
})

app.post('/api/del', function (req, res) {

	//req.body.sort
	console.log(req.body.id)
	let json = []
	db.each("SELECT * FROM items", (e, r) => {
		if(typeof r === undefined) return
			json.push(r)

	}, (err, count) => {
		if (err) 
			console.log(err)
		else{
			res.json(json)
		}
	})
})


app.listen(process.env.PORT || 1337, function () {
	console.log('Example app listening on port '+ (process.env.PORT || 1337))
})
