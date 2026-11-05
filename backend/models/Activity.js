const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'Note'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    description: {
      type: String,
      required: true
    },dueDate:{
        type:String,
        required:true,
    },
    priority:{
        type:String,
        enum:['low','medium','high'],
        default:'medium',
    },
    status:{
        type:String,
        enum:['pending','complated'],
        default:'pending',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);