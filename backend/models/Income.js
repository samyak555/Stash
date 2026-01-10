import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    source: {
        type: String,
        required: true,
        default: 'Salary',
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    note: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Index for faster queries
incomeSchema.index({ user: 1, date: -1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;
