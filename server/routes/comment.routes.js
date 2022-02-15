const express = require('express')
const router = express.Router({ mergeParams: true })
const auth = require('../middleware/auth.middleware')
const Comment = require('../models/Comment')

router
	.route('/')
	.get(auth, async (req, res) => {
		try {
			const { orderBy, equalTo } = req.query
			const list = await Comment.find({ [orderBy]: equalTo })
			res.send(list)
		} catch (e) {
			res.status(500).json({
				message:
					'На сервере произошла ошибка (get comments). Попробуйте позже.',
			})
		}
	})
	.post(auth, async (req, res) => {
		try {
			const comment = await Comment.create(req.body)

			res.status(201).send(comment)
		} catch (e) {
			res.status(500).json({
				message:
					'На сервере произошла ошибка (post comment). Попробуйте позже.',
			})
		}
	})

router.delete('/:commentId', auth, async (req, res) => {
	try {
		const { commentId } = req.params
		const comment = await Comment.findById(commentId)

		if (comment.userId.toString() === req.user._id) {
			await comment.remove()
			return res.send(null)
		} else {
			return res.status(401).json({ message: 'Unauthorized' })
		}
	} catch (e) {
		res.status(500).json({
			message:
				'На сервере произошла ошибка (delete comment). Попробуйте позже.',
		})
	}
})

module.exports = router
