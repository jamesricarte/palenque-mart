const pool = require("../../config/db");
const supabase = require("../../config/supabase");
const { v4: uuidv4 } = require("uuid");

const BUCKET_NAME = "products";

const addProduct = async (req, res) => {
  const { name, description, price, stock_quantity, user_id } = req.body;

  if (!name || !price || !stock_quantity) {
    return res
      .status(400)
      .json({ error: "Name, price, and stock quantity are required." });
  }

  if (!req.files || !req.files.productImage) {
    return res.status(400).json({ error: "Product image is required." });
  }

  const file = req.files.productImage[0];
  const fileName = `${uuidv4()}-${file.originalname}`;
  const filePath = `product-images/user_${user_id}/${fileName}`;

  try {
    // 1. Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload product image." });
    }

    // 2. Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return res.status(500).json({ error: "Failed to get image URL." });
    }
    const imageUrl = urlData.publicUrl;

    const [rows] = await pool.query(
      "SELECT id from sellers WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Seller account is unfortunately not found." });
    }

    const sellerId = rows[0].id;

    // 3. Insert product data into the database
    const [result] = await pool.query(
      "INSERT INTO products (seller_id, name, description, price, stock_quantity, image_keys) VALUES (?, ?, ?, ?, ?, ?)",
      [sellerId, name, description, price, stock_quantity, imageUrl]
    );

    res.status(201).json({
      message: "Product added successfully!",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the product." });
  }
};

module.exports = addProduct;
