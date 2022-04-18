const { profile } = require("../../models");

exports.getProfile = async (req, res) => {
  try {
   

    let data = await profile.findOne({
      where: {
        idUser: req.user.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

    data = JSON.parse(JSON.stringify(data));

    data = {
      ...data,
      image: data.image ? process.env.PATH_FILE + data.image : process.env.PATH_FILE + "Frame.png",
    };

    res.send({
      status: "success...",
      data,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};
