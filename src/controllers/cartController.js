const User = require('../models/userSchema');
const Product = require('../models/productSchema');
const { addCart } = require('../utils/cartUtils');

const getItems = async(req, res) => {
    if(req.isAuthenticated){
        const userId = req.user.userId;
        const user = await User.findById(userId).populate('cart.productId');;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.send(user.cart)
    }
    else{
        const cart = req.session.cart || { items: [] };
        console.log('====================================');
        console.log("Items in cart",cart);
        console.log('====================================');
        return res.json(cart)
    }
}

const addToCart = async(req, res) => {
    const { productId, quantity } = req.body;


    if (req.isAuthenticated) {
        const userId = req.user.userId;
        
        addCart(userId, productId, quantity)

        return res.send("successfully added to cart")
    }
    else {
        if (!req.session.cart) {
            req.session.cart = { items: [productId, quantity] };
        }
        console.log('====================================');
        console.log(req.session);
        console.log('====================================');
        const cart = req.session.cart;
        console.log('====================================');
        console.log("Items added to cart",cart);
        console.log('====================================');

        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        req.session.cart = cart;
        return res.send("Successfully added to unauthenticated cart");
    }

}

const removeFromCart = async(req, res) => {
    const { productId } = req.body;
    const quantity =  1;

    if(req.isAuthenticated){
        const userId = req.user.userId;
        console.log("user",req.user);
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const cartItem = user.cart.find(item => item.productId.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cartItem.quantity -= quantity;
        if (cartItem.quantity <= 0) {
            user.cart = user.cart.filter(item => item.productId.toString() !== productId);
        }

        await user.save();
        console.log('====================================');
        console.log( "Cart item removed",cartItem);
        console.log('====================================');

        return res.status(200).json({ 
            message: "Successfully removed from cart", 
            cartItem 
        });
    }

    else{
        const cart = req.session.cart || { items: [] };
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity -= quantity;
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }
        }
        req.session.cart = cart;
        return res.send("successfully removed from cart")
    }
}

const clearCart = async(req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.cart = [];
    await user.save();
    return res.send("successfully cleared cart")
}

const migrateCart = async (req, res, next) => {
    if (req.isAuthenticated && req.session.cart) {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const sessionCart = req.session.cart.items;
        sessionCart.forEach(sessionItem => {
            const existingItem = user.cart.find(
                item => item.productId.toString() === sessionItem.productId
            );

            if (existingItem) {
                existingItem.quantity += sessionItem.quantity;
            } else {
                user.cart.push(sessionItem);
            }
        });

        await user.save();
        req.session.cart = null;
    }
    next();
};


module.exports={
    getItems,
    addToCart,
    removeFromCart,
    clearCart,
    migrateCart
}