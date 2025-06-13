const mongoose = require('mongoose');

module.exports.dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,  // Corrected from useNewURLParser to useNewUrlParser
            useUnifiedTopology: true  // Recommended additional option
        });
        console.log("Database connected...");  // Fixed syntax (parentheses instead of brackets)
    } catch (error) {
        console.log(error.message);
        process.exit(1);  // Exit process with failure in case of connection error
    }
};