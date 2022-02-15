const express = require('express')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const User = require('../models/User')
const router = express.Router({ mergeParams: true })
const { generateUserData } = require('../utils/helpers')
const tokenService = require('../services/token.service')
const Token = require('../models/Token')

// 1. /api/auth/signUp
// 2. get data from request (email, password ...)
// 3. check for user already exists
// 4. hash password
// 5. create user
// 6. generate tokens

router.post('/signUp', [
	check('email', 'Некорректный email').isEmail(),
	check('password', 'Минимальная длина пароля 8 символов').isLength({ min: 8 }),
	async (req, res) => {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({
					error: {
						message: 'INVALID_DATA',
						code: 400,
						errors: errors.array(),
					},
				})
			}
			const { email, password } = req.body

			const isExist = await User.findOne({ email })

			if (isExist) {
				return res.status(400).json({
					error: {
						message: 'EMAIL_EXISTS',
						code: 400,
					},
				})
			}

			const hashedPassword = await bcrypt.hash(password, 12)

			const newUser = await User.create({
				...generateUserData(),
				...req.body,
				password: hashedPassword,
			})

			const tokens = tokenService.generate({ _id: newUser._id })

			await tokenService.save(newUser._id, tokens.refreshToken)

			res.status(201).send({ ...tokens, userId: newUser._id })
		} catch (e) {
			res.status(500).json({
				message: 'На сервере произошла ошибка (signUp). Попробуйте позже.',
				code: 500,
			})
		}
	},
])

// 1. Validate
// 2. Find user
// 3. Compare hashed passwords
// 4. Generate tokens
// 5. Return data

router.post('/signInWithPassword', [
	check('email', 'Некорректный email').normalizeEmail().isEmail(),
	check('password', 'Пароль не может быть пустым').exists(),
	async (req, res) => {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({
					error: {
						message: 'INVALID_DATA',
						code: 400,
						errors: errors.array(),
					},
				})
			}

			const { email, password } = req.body
			const existUser = await User.findOne({ email })

			if (!existUser) {
				return res.status(400).json({
					error: {
						message: 'EMAIL_NOT_FOUND',
						code: 400,
					},
				})
			}

			const isEqual = await bcrypt.compare(password, existUser.password)

			if (!isEqual) {
				return res.status(400).json({
					error: {
						message: 'INVALID_PASSWORD',
						code: 400,
					},
				})
			}

			const tokens = tokenService.generate({ _id: existUser._id })

			await tokenService.save(existUser._id, tokens.refreshToken)

			res.status(200).send({
				...tokens,
				userId: existUser._id,
			})
		} catch (error) {
			res.status(500).json({
				message: 'На сервере произошла ошибка (signIn). Попробуйте позже.',
			})
		}
	},
])

function isTokenInvalid(data, dbToken) {
	return !data || !dbToken || data._id !== dbToken?.user?.toString()
}

router.post('/token', async (req, res) => {
	try {
		const { refresh_token: refreshToken } = req.body

		const data = tokenService.validateRefresh(refreshToken)

		const dbToken = await tokenService.findToken(refreshToken)

		if (isTokenInvalid(data, dbToken)) {
			return res.status(401).json({
				message: 'Unauthorized',
			})
		}

		const tokens = await tokenService.generate({
			id: dbToken.user.toString(),
		})

		await tokenService.save(data._id, tokens.refreshToken)
		res.status(200).send({ ...tokens, userId: data._id })
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка (signIn). Попробуйте позже.',
		})
	}
})

module.exports = router
