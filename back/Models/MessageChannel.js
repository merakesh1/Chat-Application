const mongoose = require('mongoose');

const MessageChannel=new mongoose.Schema({
    User_MessageChannel:{
        type:Array,
        required:true
    }
}, { collection: 'MessagesChannel' });

module.exports=mongoose.model('Messages_Channel',MessageChannel);