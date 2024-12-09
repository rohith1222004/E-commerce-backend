const User = require('../models/userSchema');
const Product = require('../models/productSchema');

const addCart = async(userId, productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    
    const user = await User.findById(userId);
    console.log(user);
    
    const cartItem = user.cart.find(item => item.productId.toString() === productId);
    console.log("cartItem : ", cartItem);
    
    if (cartItem) {
        console.log('Updating quantity...');
        cartItem.quantity += quantity;
    } 
    else {
        console.log('Adding new item to cart...');
        user.cart.push({
            productId,
            quantity,
            price: product.price
        });
    }
    await user.save();
    console.log('Cart after:', user.cart);
}

module.exports = {
    addCart
}