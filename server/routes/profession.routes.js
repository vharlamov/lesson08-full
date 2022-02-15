const express = require('express')
const router = express.Router({ mergeParams: true })
const Profession = require('../models/Profession')

router.get('/', async (req, res) => {
	try {
		const list = await Profession.find()
		res.status(200).send(list)
	} catch (error) {
		res
			.status(500)
			.json({ message: 'На сервере произошла ошибка. Попробуйте позже.' })
	}
})

module.exports = router
