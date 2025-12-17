function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

exports.handler = async () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return json(500, { error: "Missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET" });
  }

  // These are safe to expose (NOT your API secret)
  return json(200, { cloudName, uploadPreset });
};
