const professionMock = require('../mock/professions.json')
const qualitiesMock = require('../mock/qualities.json')

const Profession = require('../models/Profession')
const Quality = require('../models/Quality')

module.exports = async () => {
	const professions = await Profession.find()
	if (professions.length !== professionMock.length) {
		await createInitialEntity(Profession, professionMock)
	}
	const qualities = await Quality.find()
	if (qualities.length !== qualitiesMock.length) {
		await createInitialEntity(Quality, qualitiesMock)
	}
}

async function createInitialEntity(Model, mock) {
	await Model.collection.drop() // Очистка данных модели

	return Promise.all(
		mock.map(async (item) => {
			try {
				delete item._id // id присваивается базой, поэтому убираем id из mock
				const newItem = new Model(item) // Создаётся экземпляр модели
				await newItem.save() // и отправляется в базу
				return newItem
			} catch (e) {
				return e
			}
		})
	)
}
