const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("Zikr", "root", "hikmat2005$", {
  host: "localhost",
  dialect: "mysql",
});

const Hatm = sequelize.define("Hatm", {
  title: {
    type:DataTypes.STRING,
  },
  quantity:{
    type:DataTypes.INTEGER,
  },
  numberOfUsers:{
    type:DataTypes.INTEGER
  },
  hatmProgress:{
    type:DataTypes.INTEGER
  }
});
// Sync the models with the database
(async () => {
  try {
    await sequelize.sync();
    console.log("Client table created!");
  } catch (error) {
    console.error("Error creating table:", error);
  }
})();

module.exports = { sequelize, Hatm };
