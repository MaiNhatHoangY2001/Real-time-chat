const mongoose = require('mongoose');
const { IndividualChat, User } = require('../model');

const individualChatController = {
	//ADD INDIVIDUAL CHAT
	addIndividualChat: async (req, res) => {
		try {
			const newIndi = new IndividualChat(req.body);
			const saveIndi = await newIndi.save();
			if (req.body.user) {
				const user = User.findById(req.body.user);
				await user.updateOne({ $push: { individualChats: saveIndi._id } });
			}
			res.status(200).json(saveIndi);
		} catch (error) {
			res.status(500).json(error);
		}
	},
	//GET CHAT WITH USER ID AND SENDER
	getListIndividualChat: async (req, res) => {
		try {
			const idSender = mongoose.Types.ObjectId(req.body.sender);
			const idUser = mongoose.Types.ObjectId(req.body.user);

			const listIndi = await IndividualChat.aggregate([
				{
					$lookup: {
						from: 'messages',
						localField: 'message',
						foreignField: '_id',
						as: 'message',
					},
				},
				{
					$match: {
						$or: [
							{
								sender: req.body.sender,
								user: idUser,
							},
							{
								sender: req.body.user,
								user: idSender,
							},
						],
					},
				},

				{
					$unwind: '$message',
				},
				{
					$project: {
						'message.content': 1,
						'message.time': 1,
						'sender':1,
						_id: 0,
					},
				},
				{
					$sort: {
						'message.time': 1,
					},
				},
			]);

			res.status(200).json(listIndi);
		} catch (error) {
			res.status(500).json(error);
		}
	},
};

module.exports = individualChatController;
