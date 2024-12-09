const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const app = express();
app.use(express.json())
const session = require('express-session');
const connectToDatabase = require("./db/dbConnection")
const { authenticateToken } = require('./middleware/authMiddleware');
const cors = require('cors')

const authRouter = require("./routes/authRoutes")
const userRouter = require("./routes/userRoutes")
const productRouter = require("./routes/productRoutes")
const cartRouter = require("./routes/cartRoutes")
const quotationRouter = require("./routes/quotationRoutes");
const { isAuthenticated } = require('./middleware/authMiddleware');

connectToDatabase();
app.use(cors())

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/auth',authRouter)
app.use('/users',userRouter)
app.use('/product',productRouter)
app.use('/cart',authenticateToken,cartRouter)
app.use('/quotation',authenticateToken,isAuthenticated,quotationRouter)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
