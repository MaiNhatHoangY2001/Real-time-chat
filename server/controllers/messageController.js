const { Message, IndividualChat, GroupChat } = require('../model');

const messageController = {
	// ADD A MESSAGE
	addMessage: async (req, res) => {
		try {
			const newMes = new Message(req.body);
			const saveMes = await newMes.save();
			if (req.body.individualChat) {
				const individualChat = IndividualChat.findById(req.body.individualChat);
				await individualChat.updateOne({ $push: { message: saveMes._id } });
			}
			if (req.body.groupChat) {
				const groupChat = GroupChat.findById(req.body.groupChat);
				await groupChat.updateOne({ $push: { message: saveMes._id } });
			}

			res.status(200).json(saveMes);
		} catch (error) {
			res.status(500).json(error);
		}
	},

	//GET All MESSAGE WITH SENDER
	getAllMsgOnePerson: async (req, res) => {
		try {
			
			const messages = await Message.find({sender:req.params.sender});
			res.status(200).json(messages);
		} catch (error) {
			res.status(500).json(error);
		}
	},
};

module.exports = messageController;
