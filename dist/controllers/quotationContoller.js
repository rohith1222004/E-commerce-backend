const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const User = require('../models/userSchema');
const generateQuotation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('cart.productId');
    if (!user) {
      return res.status(404).send('User not found');
    }
    const cartItems = user.cart;
    const subtotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    const templateData = {
      cartItems: cartItems,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2)
    };
    const html = await ejs.renderFile(path.join(__dirname, '../../Quotations/testQuo.ejs'), templateData);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const filePath = path.join(__dirname, `../../Quotations/download/quotation_${userId}_${Date.now()}.pdf`);
    await page.pdf({
      path: filePath,
      format: 'A4'
    });
    await browser.close();
    res.status(200).json({
      message: 'Quotation generated successfully!',
      downloadLink: filePath
    });
  } catch (err) {
    console.error('Error generating quotation:', err);
    res.status(500).send('Server Error');
  }
};
module.exports = {
  generateQuotation
};