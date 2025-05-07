// import mognoose, { mongo } from 'mongoose';

// const adminSchema = new mongoose.Schema({
//     username : {
//         type : String,
//         required : true,
//     },
//     email : {
//         type : String,
//         required : true
//     },
//     password : {
//         type : String,
//         required : true
//     }
// })

// const admin =   mongoose.model("Admin",adminSchema);
// export default admin; 


import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String,
    }
});

const admin = mongoose.model("Admin", adminSchema);

export default admin;