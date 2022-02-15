const { Schema, model } = require('mongoose')

const schema = new Schema(
	{
		name: { type: String },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		completedMeetings: Number,
		image: { type: String },
		rate: Number,
		sex: { type: String, enum: ['male', 'female', 'other'] },
		profession: { type: Schema.Types.ObjectId, ref: 'profession' },
		qualities: [{ type: Schema.Types.ObjectId, ref: 'quality' }],
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

module.exports = model('User', schema)
