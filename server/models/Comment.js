const { Schema, model } = require('mongoose')

const schema = new Schema(
	{
		content: { type: String, required: true },
		pageId: { type: Schema.Types.ObjectId, ref: 'user' },
		userId: { type: Schema.Types.ObjectId, ref: 'user' },
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

module.exports = model('Comment', schema)
