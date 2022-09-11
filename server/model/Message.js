const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    type_Msg: {
        type: Number,
        required: true,
    },
    time:{
        type:Date,
        required:true,
        default: Date.now
    },
    content: {
        type: String,
        required: true,
    },
    individualChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IndividualChat',
    },
    groupChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupChat',
    }
});

module.exports =  mongoose.model('Message', messageSchema);