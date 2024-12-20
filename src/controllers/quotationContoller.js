const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const user = require('../models/userDataSchema');

const test = async (req, res) => {
  try {
    console.log('Received Cart Items:', req.body.cartItems);

    const { name, email, phone } = req.body.formData;

    // Validation: Ensure all fields are provided
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if a quotation with the provided email already exists
    const existingQuotation = await user.findOne({ email });
    if (existingQuotation) {
      return res
        .status(400)
        .json({ message: "Quotation with this email already exists." });
    }

    // Save new quotation to the database
    const newQuotation = new user({ name, email, phone });
    await newQuotation.save();

    // Calculate totals
    const cartItems = req.body.cartItems;
    const subtotal = cartItems.reduce(
      (total, item) => total + item.count * item.product.salePrice,
      0
    );
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    // Prepare template data
    const templateData = {
      name,
      email,
      cartItems,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
    };

    // Path to the EJS template
    const templatePath = path.join(__dirname, '../../../Backend/Quotations/views/quotation.ejs');

    // Render the EJS template to HTML
    const html = await ejs.renderFile(templatePath, templateData);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Define PDF file path
    const userId = newQuotation._id.toString();
    const pdfPath = path.join(__dirname, `../../../Backend/Quotations/quotation_${userId}.pdf`);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    // Send email with PDF attachment
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Quotation',
      text: 'Please find your quotation attached.',
      attachments: [
        {
          filename: `quotation_${userId}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Optionally delete the PDF after sending the email
    fs.unlink(pdfPath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting file:', unlinkErr);
    });

    res.status(200).json({ message: 'Quotation sent to email successfully.' });
  } catch (error) {
    console.error("Error processing quotation:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const generateQuotation = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await user.findById(userId).populate('cart.productId');

    if (!user) {
      return res.status(404).send('User not found');
    }

    const cartItems = user.cart;
    const subtotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    const templateData = {
      name: user.name,
      email: user.email,
      cartItems: cartItems,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
    };

    // Path to the EJS template
    const templatePath = path.join(__dirname, '../../../Backend/Quotations/views/quotation.ejs');

    // Render the EJS template to HTML
    const html = await ejs.renderFile(templatePath, templateData);

    // Use Puppeteer to generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Define the PDF file path
    const pdfPath = path.join(__dirname, `../../../Backend/Quotations/quotation_${userId}.pdf`);

    // Generate the PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    // Email the PDF
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Your Quotation',
      text: 'Please find your quotation attached.',
      attachments: [
        {
          filename: `quotation_${userId}.pdf`,
          path: pdfPath, // Attach the generated PDF
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Optionally delete the PDF after sending the email
    fs.unlink(pdfPath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting file:', unlinkErr);
    });

    res.status(200).json({ message: 'Quotation sent to email successfully.' });
  } catch (error) {
    console.error('Error generating or sending quotation:', error);
    res.status(500).send('Error generating or sending quotation');
  }
};

module.exports = { generateQuotation,test };
