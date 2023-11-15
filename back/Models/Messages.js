const mongoose = require('mongoose');

const message_Model=new mongoose.Schema({
   conversationId:{
    type: String,
    required:true
   },
   senderId:{
    type: String,
    required:true
   },
   messages:{
    type:String,
    required:true
   },
   recieverId:{
    type:String
   }
}, { collection: 'Messages' });

module.exports=mongoose.model('Messages',message_Model);