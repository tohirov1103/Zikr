const {getConnection} = require('../db/connectDb');

const isAdmin = async(req,res,next)=>{
    try {
        const idGroup = req.params.id;
        const userId = req.body.id;
        const connection = await getConnection();
        await connection.connect(function(err){
            const query = 'SELECT adminId FROM \`Group\` WHERE adminId = userId';
            connection.query(query,(err,result)=>{
                if(err){
                    res.status(404).json({message:"Not Found"})
                }
                next()
            })
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
module.exports = {isAdmin};