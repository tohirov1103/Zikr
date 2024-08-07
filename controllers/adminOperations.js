const {getConnection} = require('../db/connectDb');


const changeNameOfGroup = async(req,res)=>{
    try {
        const idGroup = req.params.id;
        const newName = req.body.name;
        const connection = await getConnection();
        await connection.connect(function(err){
            const query = `UPDATE \`Group\` SET name = ${newName} WHERE idGroup = ${idGroup}`;
            connection.query(query,(err,result)=>{
                if(err){
                    res.status(404).json({message:"Not Found"})
                }
                res.json({message:`Name of group successfully changed to ${newName}`});
            })
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error);
    }
}
const deleteUser = async(req,res)=>{
    try {
        const idGroup = req.params.id;
        const userId = req.body.id;
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error);
    }
}