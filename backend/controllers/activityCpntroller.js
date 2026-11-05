const Activity = require("../models/Activity")

exports.createActivity = async (req,res)=>{
    try{
        const activity = new Activity(req.body);
        await activity.save();
        res.this.status(201).json({success:true, data:activity})
    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }
}

exports.getLeadActivities = async(req,res)=>{
    try{
        const activities = await Activity.find({lead:req.params.leadId})
        .populate('performedBy','name email')
        .sort({createdAt:-1});
        res.status(200).json({success:true,data:activities})
    }catch(err){
        res.status(500).json({success:false,messange:err.message})
    }
}
exports.getOverdueActivities = async(req,res)=>{
    try{
        const currentDate= new Date();
        const overdue = await Activity.find({
            status:'pending',dueDate:{$lt:currentDate}
        })
        .populate('lead','name company email phone')
        .populate('performedBy','name email')
        .sort({dueDate:1})
        res.status(200).json({success:true,count:overdue.length,data:overdue})
    }catch(err){
        res.status(500).json({success:false,messange:err.message})
    }
}

exports.getUpcomingActivities = async(req,res)=>{
    try{
        const currentDate =  new Date()
        const upcoming=await Activity.find({
            status:'pending',
            dueDate:{$gte:currentDate},
        }) 
        .populate('lead ','name company email phone')
        .populate("performedBy","name email")
        .sort({dueDate:1})
        res.status(200).json({success:true,count:upcoming.length,data:upcoming})
    }catch(err){
res.status(500).json({messange:false,messange:err.message});
    }
}