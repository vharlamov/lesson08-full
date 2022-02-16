const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const chalk = require('chalk')
const initDatabase = require('./startUp/initDatabase')
const routes = require('./routes')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(express.json()) // Нормализует входящие данные (POST, PUT)
app.use(express.urlencoded({ extended: false })) // ???

app.use(cors())
app.use('/api', routes) // Middleware для роутинга

// if (process.env.NODE_ENV === 'production') {
// 	console.log('Production')
// } else if (process.env.NODE_ENV === 'development') {
// 	console.log('Development')
// }

if (process.env.NODE_ENV === 'production') {
	app.use('/', express.static(path.join(__dirname, 'client')))

	const indexPath = path.join(__dirname, 'client', 'index.html')

	app.get('*', (req, res) => {
		res.sendFile(indexPath)
	})
}

const PORT = config.get('port') ?? 8080 // Берёт значение порта из config/default.json

async function start() {
	try {
		mongoose.connection.once('open', () => {
			// Проверяет наличие необходимых данных в ДБ
			initDatabase() // При отсутствии или нессответствии данных заливает их в ДБ
		})
		await mongoose.connect(config.get('mongoUri')) // Соединение с БД

		console.log(chalk.cyan(`MongoDB connected`))

		app.listen(PORT, () => {
			// Сервер запустится только после подключения БД
			console.log(chalk.cyan(`Server has been started on ${PORT}...`))
		})
	} catch (error) {
		console.log(chalk.red(error.message))
		process.exit(1) // В случае ошибки Node завершается
	}
}

start()
