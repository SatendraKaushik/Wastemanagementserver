// const mongoose = require('mongoose');
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TransferSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'wasteCustomer',
        required: true
    },
    recipientEmail: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Transfer amount must be at least 1']
    },
    note: {
        type: String,
        trim: true,
        default: ''
    },
}, {
    timestamps: true
});


const transferModel = mongoose.model('Transfer', TransferSchema);
export default transferModel;