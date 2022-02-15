const express = require('express')
const router = express.Router({ mergeParams: true })
const User = require('../models/User')
const auth = require('../middleware/auth.middleware')

router.get('/', auth, async (req, res) => {
	try {
		const data = await User.find()

		const list = data.map((user) => {
			delete user._doc.password
			return user
		})

		res.send(list)
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка (get user). Попробуйте позже.',
		})
	}
})

router.patch('/:id', async (req, res) => {
	try {
		const { id } = req.params

		if (id === req.body._id) {
			const updatedUser = await User.findByIdAndUpdate(id, req.body, {
				new: true,
			})

			delete updatedUser.password

			res.status(200).send(updatedUser)
		} else {
			return res.status(401).json({ message: 'Unauthorized' })
		}
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка (put user). Попробуйте позже.',
		})
	}
})

module.exports = router
