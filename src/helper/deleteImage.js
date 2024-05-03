const fs = require("fs/promises");

const deleteImage = async (userImagePath) => {
  try {
    await fs.access(userImagePath);
    await fs.unlink(userImagePath);
    // console.log("Image was deleted");
  } catch (error) {
    console.error("Image does not exist");
    throw error;
  }

  // fs.access(userImagePath)
  //   .then(() => {
  //     fs.unlink(userImagePath);
  //   })
  //   .then(() => {
  //     console.log("User image was deleted");
  //   })
  //   .catch((err) => {
  //     console.error("User image does not exist");
  //   });
};

// const deleteImage = (userImagePath) => {
//   fs.access(userImagePath)
//     .then(() => {
//       fs.unlink(userImagePath);
//     })
//     .then(() => {
//       console.log("User image was deleted");
//     })
//     .catch((err) => {
//       console.error("User image does not exist");
//     });
// };

module.exports = deleteImage;
