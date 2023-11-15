const mongoose = require('mongoose');

const Users=new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    },
    temp:{
        type:String
    },
    mobile:{
        type:String,
/*         required:true
 */    },
    showPassword:{
        type:Boolean
    }
}, { collection: 'Users' });

module.exports=mongoose.model('Users',Users);