import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    limit: {
        type: Number,
        required: true,
        min: 0,
    },
    period: {
        type: String,
        enum: ['monthly', 'yearly', 'weekly'],
        default: 'monthly',
    },
    alertThreshold: {
        type: Number,
        default: 80, // Percent
    },
}, {
    timestamps: true,
});

budgetSchema.index({ user: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
