const { Schema, model } = require('mongoose')

// Модель служит для структурирования и именования данных, передаваемых в БД
// Схема определяет структуру и типизацию данных

const schema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

module.exports = model('Profession', schema) // В модель передаются название сущности и её схема
