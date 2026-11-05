const AuditLog = require("../models/AuditLog");


const logActive = async(req,logAction,entity,entityId,details)=>{
    try{
        const actorId = req && req.user ?(req.user._id || req.user._id) : null;

        await AuditLog.create({actor:actorId,action:action,entity:entity,entityId:entityId, dettails:{messange:details}})
    }catch(error){
        console.error("Audit log error",error.messange);
        
    }
}

module.exports = logActive;