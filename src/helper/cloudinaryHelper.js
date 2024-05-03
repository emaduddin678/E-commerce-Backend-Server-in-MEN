const publicIdWithoutExtensionFromUrl = async (imageUrl) => {
  const pathSegments = imageUrl.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];
  //   const valueWithoutExtension = lastSegment.replace(".jpg", "");
  const valueWithoutExtension = lastSegment.split(".")[0];
//   console.log(lastSegment);
//   console.log(lastSegment.split("."));
//   console.log(valueWithoutExtension);
  return valueWithoutExtension;
};

module.exports = { publicIdWithoutExtensionFromUrl };
