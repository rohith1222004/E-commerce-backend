const Product = require("../models/productSchema")
const {uploadToS3} = require("../utils/aws-s3")
const getProduct = async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        const products = await Product.find();
        return res.status(200).send(products); 
      }
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }
      res.status(200).send(product);
    } catch (error) {
      res.status(500).send({ message: "Server error", error: error.message });
    }
};
// const createProduct = async(req,res) =>{
//     const {productName,price,description,imageUrl} = req.body
//     const product = new Product({
//         productName,
//         price,
//         description,
//         imageUrl
//     })
//     await product.save()
//     return res.send(product)
// }

const createProduct = async (req, res) => {
  const { productName, price, description } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const imageUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype);
    const newProduct = new Product({
      productName,
      price,
      description,
      imageUrl,
    });

    await newProduct.save();

    return res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error uploading image or saving product:', error);
    return res.status(500).json({ message: 'Error uploading image or saving product' });
  }
};
module.exports={
    getProduct,
    createProduct
}