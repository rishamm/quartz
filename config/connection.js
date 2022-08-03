const mongoose =require ('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost/quartz', { useNewUrlParser: true });
        console.log('database connected successfully');
    } catch (err) {
        console.error.bind(console, 'connection error')
        process.exit(1)
    }
}

connectDB();


