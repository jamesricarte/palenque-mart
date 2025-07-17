const supabase = require("../../config/supabase")

const getSignedDocumentUrl = async (req, res) => {
  const { bucket, path } = req.body

  if (!bucket || !path) {
    return res.status(400).json({
      message: "Bucket and path are required.",
      success: false,
      error: { code: "MISSING_PARAMS" },
    })
  }

  // Optional: Validate bucket name to prevent access to unintended buckets
  const allowedBuckets = ["seller-documents", "delivery-partner-documents"]
  if (!allowedBuckets.includes(bucket)) {
    return res.status(403).json({
      message: "Access to this bucket is not allowed.",
      success: false,
      error: { code: "FORBIDDEN_BUCKET" },
    })
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60) // URL expires in 60 seconds

    if (error) {
      throw error
    }

    res.status(200).json({
      message: "Signed URL generated successfully.",
      success: true,
      data: {
        signedUrl: data.signedUrl,
      },
    })
  } catch (error) {
    console.error("Error generating signed URL:", error)
    return res.status(500).json({
      message: "Could not generate signed URL.",
      success: false,
      error: { code: "SIGNED_URL_ERROR", details: error.message },
    })
  }
}

module.exports = getSignedDocumentUrl
