const db = require("../../config/db");

module.exports = updateProfile = async (req, res) => {
  let { id, first_name, last_name, email, phone, birth_date, gender } =
    req.body;

  if (!email || !phone) {
    return res
      .status(400)
      .json({ message: "Either email or phone is required!", success: false });
  }

  ({ id, first_name, last_name, email, phone, birth_date, gender } = {
    id: id ?? null,
    first_name: first_name ?? null,
    last_name: last_name ?? null,
    email: email ?? null,
    phone: phone ?? null,
    birth_date: birth_date ?? null,
    gender: gender ?? null,
  });

  try {
    const [result] = await db.execute(
      "UPDATE users SET first_name = ?, last_name = ? , email = ? , phone = ?, birth_date = ?, gender = ? WHERE id = ?",
      [first_name, last_name, email, phone, birth_date, gender, id]
    );

    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "User is unfortunately not found!", success: false });
    }

    const { password, ...userData } = rows[0];

    res.status(200).json({
      message: "Profile updated successfully!",
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
