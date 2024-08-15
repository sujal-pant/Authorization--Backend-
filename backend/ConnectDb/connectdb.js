import mongoose from "mongoose";
export const connectDb = async () => {

    try {
    let conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`connected on ${conn.connection.host}`)
    }
    catch (err) {
        console.log(`Error: ${err.message}`)
        process.exit(1)

        //1 is failed and 0 is successful
    }
}   