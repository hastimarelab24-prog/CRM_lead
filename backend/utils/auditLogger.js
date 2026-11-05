
const AuditLog = require("../models/AuditLog");
const logAction=async(
  req,
  action,
  entity,
  entityId = null,
  details = ''
)=> {
  try {
    return await AuditLog.create({
      user: req.user.id,
      action,
      entity,
      entityId,
      details,
      ipAddress :req.ip || req.headers['X-forwaeded-for'] || '',
    });
  } catch (error) {
    console.error("Audit log creation failed:", error.message);
    // return null;
  }
}

module.exports = logAction;
