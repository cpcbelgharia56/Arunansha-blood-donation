const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'arunansha2003@gmail.com',
        pass: 'bapqckjlcikzadme'
    }
});

const app = express();
const mongodbUrl = 'mongodb+srv://arunansha2003:a123456k@cluster0.xrvowrs.mongodb.net/'
mongoose.connect(mongodbUrl);
const database = mongoose.connection;
app.use(cors({
    origin: "*"
}))

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.use(express.json());
const Donor = require('./donor')

app.use(express.json());
const User = require('./user')

async function hashPassword(plaintextPassword) {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    // Store hash in the database
    return hash;
}

// compare password
async function comparePassword(plaintextPassword, hash) {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

//Post Method
app.get('/', (req, res) => {

    res.send('welcome in mern')
})
app.get('/about', (req, res) => {

    res.send('about mern')
})

// Define a route to handle sending emails
app.post('/send-email', async (req, res) => {
    // Define email options

    const response = await User.find({ email: req.body.email })

    if (response.length > 0) {
        //const data = await User.find({ email: req.body.email });
        const otp = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)

        const mailOptions = {
            from: 'arunansha2003@gmail.com',
            to: req.body.email,
            subject: 'Password sent By Blood Donation App.',
            //text: 'Hello' + data[0].name + ',Your password is' + data[0].password
            text: 'Your One Time Password(OTP) is :' + otp
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.send('Error sending email');
            } else {
                console.log('Email sent:', info.response);
                res.send('Email sent successfully');
            }
        });
    }
    else {
        res.send('Invalid email');
    }
});

//Post Method
app.post('/registerDonor', async (req, res) => {

    const password = req.body.password

    const hpass = await hashPassword(password)

    console.log(97, hpass)

    const data = new Donor({
        name: req.body.name,
        email: req.body.email,
        password: hpass,
        address: req.body.address,
        contact: req.body.contact,
        bloodgroup: req.body.bloodgroup,
        gender:req.body.gender,
        dob:req.body.dob
    })
    try {
        const response = await data.save();
        res.status(200).json(response)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

app.post('/registerUser', async (req, res) => {

    const password = req.body.password

    const hpass = await hashPassword(password)

    const data = new User({
        name: req.body.name,
        email: req.body.email,
        password: hpass,
        address: req.body.address,
        contact: req.body.contact,
        gender: req.body.gender,
        dob: req.body.dob
    })
    try {
        const response = await data.save();
        res.status(200).json(response)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})


//Post Method
app.post('/loginDonor', async (req, res) => {

    const password = req.body.password

    const res1 = await Donor.find({ email: req.body.email })

    const hpass = res1[0].password

    const result = await comparePassword(password, hpass)

    console.log(145, result)

    if (result) {
        res.send({ 'message': true })
    }
    else {
        res.send({ 'message': false })
    }

})

app.post('/loginUser', async (req, res) => {
    const password = req.body.password

    const res1 = await User.find({ email: req.body.email })

    const hpass = res1[0].password

    const result = await comparePassword(password, hpass)

    console.log(145, result)

    if (result) {
        res.send({ 'message': true })
    }
    else {
        res.send({ 'message': false })
    }

})

app.post('/searchboth', async (req, res) => {

    try {
        const data = await Donor.find({ address: { $regex: req.body.address }, "bloodgroup": req.body.bloodgroup });
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

})

app.post('/validateEmailUser', async (req, res) => {

    try {
        const data = await User.find({ "email": req.body.email });
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

})

app.post('/validateEmailDonor', async (req, res) => {

    try {
        const data = await Donor.find({ "email": req.body.email });
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

})

//Get all Method
app.get('/getAllDonors', async (req, res) => {
    try {
        const data = await Donor.find();
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.get('/getAllUsers', async (req, res) => {
    try {
        const data = await User.find();
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.get('/SearchbyBloodgroup/:bloodgroup', async (req, res) => {
    try {
        const data = await Donor.find({ "bloodgroup": req.params.bloodgroup });
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

})

app.get('/search/:address', async (req, res) => {
    try {
        const data = await Donor.find({ "address": req.params.address });
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

})

app.get('/searchbyaddress/:address', async (req, res) => {
    const address = req.params.address
    try {
        const data = await Donor.find({ address: { $regex: address } }); //regex jekono key theke find korbe 
        //onno kichu die search korte hole regex er por seta likhte hobe
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

})

//Get by ID Method
app.get('/getDonorsbyId/:id', async (req, res) => {
    try {
        const data = await Donor.findById(req.params.id);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.get('/getUsersbyId/:id', async (req, res) => {
    try {
        const data = await User.findById(req.params.id);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Update by ID Method
app.patch('/updateDonor/:id', async (req, res) => {

    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Donor.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

app.patch('/updateUser/:id', async (req, res) => {

    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await User.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

app.patch('/updateUserByEmail/:email', async (req, res) => {
    const password = req.body.password

    const hpass = await hashPassword(password)

    console.log(97, hpass)
    try {
        const data = await User.find({ "email": req.params.email })
        const id = data[0]._id
        const updatedData = req.body;
        req.body.password = hpass
        const options = { new: true };

        const result = await User.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

app.patch('/updateDonorByEmail/:email', async (req, res) => {
    const password = req.body.password //body theke password ta tolar jonno

    const hpass = await hashPassword(password) //hash function er je result return korbe seta hpass e store korbe

    try {
        const data = await Donor.find({ "email": req.params.email })
        const id = data[0]._id
        const updatedData = req.body;
        req.body.password = hpass
        const options = { new: true };

        const result = await Donor.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Delete by ID Method

app.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Donor.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

app.delete('/deleteUser/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await User.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// The default route for all other paths
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});


app.listen(5000, () => {
    console.log(`Server Started at ${5000}`)
})

//ekhane api create hoeche database er sathe kotha bolar jonno
//patch-update korar jonno   //eita params mane link theke nay
//post-register korar jonno    //eita body theke nay
//get-information get korar jonno  //eitao params link theke nay