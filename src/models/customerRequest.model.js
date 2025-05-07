import mongoose from 'mongoose'

const requestSchema = await mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Other']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add a quantity'],
        min: [1, 'Quantity must be at least 1']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'wastecustomer',

    },
    coinReward: {
        type: Number,
        default: 0
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: "Not Mentioned"
    }
}, {
    timestamps: true
})

const CustomerRequest = new mongoose.model("Customer-Request", requestSchema);

export default CustomerRequest;
