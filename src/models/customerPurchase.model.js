import mongoose from "mongoose"

const purchaseSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Types.ObjectId,
        ref: "wastecustomer"
    },
    productId: String,
    productName: String,
    productPrice: Number
})

const purchaseModel = new mongoose.model('Purchase', purchaseSchema);

export default purchaseModel;