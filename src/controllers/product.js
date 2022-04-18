const {
    product,
    user, 
    category,
    categoryproduct
} = require('../../models');


//Menambahkan Produk
exports.addProduct = async (req, res) => {
    try {

      let { idCategory } = req.body;
      idCategory = idCategory.split(",");
  
      const data = {
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        image: req.file.filename,
        qty: req.body.qty,
        idUser: req.user.id,
      };
  
      console.log(data);

      let newProduct = await product.create(data);
  
      const productCategoryData = idCategory.map((item) => {
        return { idProduct: newProduct.id, idCategory: parseInt(item) };
      });
  
      await categoryproduct.bulkCreate(productCategoryData);
  
      let productData = await product.findOne({
        where: {
          id: newProduct.id,
        },
        include: [
          {
            model: user,
            as: "user",
            attributes: {
              exclude: ["createdAt", "updatedAt", "password"],
            },
          },
          {
            model: category,
            as: "categories",
            through: {
              model: categoryproduct,
              as: "bridge",
              attributes: [],
            },
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        },
      });
      productData = JSON.parse(JSON.stringify(productData));
  
      res.send({
        status: "success...",
        data: {
          ...productData,
          image: process.env.PATH_FILE + productData.image,
        },
      });

      /* const data = req.body;
  
      data.image = req.file.filename;
      data.idUser = req.user.id;
  
      const newProduct = await product.create(data);
  
      let productdata = await product.findOne({
        where: {
          id: newProduct.id,
        },
        include: [
          {
            model: user,
            as: 'user',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'password'],
            },
          },
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'idUser'],
        },
      });
  
      res.send({
        status: 'success',
        data:{
            productdata: {
                id: productdata.id,
                image: productdata.image,
                title: productdata.name, //Ini keynya berubah jadi title
                desc: productdata.desc,
                price: productdata.price,
                qty: productdata.qty,
                user: productdata.user
            }
        },
      }); */
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: 'failed',
        message: 'Server Error',
      });
    }
};

//Fetch Product 
exports.getProducts = async (req, res) => {
    try {

      let data = await product.findAll({
        include: [
          {
            model: user,
            as: "user",
            attributes: {
              exclude: ["createdAt", "updatedAt", "password"],
            },
          },
          {
            model: category,
            as: "categories",
            through: {
              model: categoryproduct,
              as: "bridge",
              attributes: [],
            },
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        },
      });

      data = JSON.parse(JSON.stringify(data));

        data = data.map((item) => {
          item.image = process.env.PATH_FILE + item.image;
          return item;
        });
    
        res.send({
          status: 'success',
          data:{
              products: data
          },
        });
      } catch (error) {
        console.log(error);
        res.send({
          status: 'failed',
          message: 'Server Error',
        });
      }
};

//Fetch Detail Product
exports.getProduct = async (req, res) => {
    try {

      const { id } = req.params;
    let data = await product.findOne({
      where: {
        id,
      },
      include: [
        {
          model: user,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: category,
          as: "categories",
          through: {
            model: categoryproduct,
            as: "bridge",
            attributes: [],
          },
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

    data = JSON.parse(JSON.stringify(data));

    data = {
      ...data,
      image: process.env.PATH_FILE + data.image,
    };

    res.send({
      status: "success...",
      data,
    });

        /* const id = req.params.id;

        let data = await product.findAll({
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'idUser'],
            },
            where: {
                id,
              }
          });
    
        data = data.map((item) => {
          item.image = process.env.PATH_FILE + item.image;
          return item;
        });
    
        res.send({
          status: 'success',
          data:{
              products: data
          },
        }); */
      } catch (error) {
        console.log(error);
        res.send({
          status: 'failed',
          message: 'Server Error',
        });
      }
};

//Update Product
exports.updateProduct = async (req, res) => {
    try {

      const { id } = req.params;
    let { categoryId } = req.body;
    categoryId = await categoryId.split(",");

    const data = {
      name: req?.body?.name,
      desc: req?.body.desc,
      price: req?.body?.price,
      image: req?.file?.filename,
      qty: req?.body?.qty,
      idUser: req?.user?.id,
    };

    await categoryproduct.destroy({
      where: {
        idProduct: id,
      },
    });

    let productCategoryData = [];
    if (categoryId != 0 && categoryId[0] != "") {
      productCategoryData = categoryId.map((item) => {
        return { idProduct: parseInt(id), idCategory: parseInt(item) };
      });
    }

    if (productCategoryData.length != 0) {
      await categoryproduct.bulkCreate(productCategoryData);
    }

    await product.update(data, {
      where: {
        id,
      },
    });

    res.send({
      status: "success",
      data: {
        id,
        data,
        productCategoryData,
        image: req?.file?.filename,
      },
    });
        /* const id = req.params.id;
        const data = req.body;
        data.image = req.file.filename;

        await product.update(data, {
          where: {
            id,
          },
        });
    
        res.send({
          status: 'success',
          data:{
            products: {
                id: data.id,
                image: data.image,
                title: data.name, //Ini keynya berubah jadi title
                desc: data.desc,
                price: data.price,
                qty: data.qty,
            }
        },
        }); */
      } catch (error) {
        console.log(error);
        res.send({
          status: 'failed',
          message: 'Server Error',
        });
      }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
    
        await product.destroy({
          where: { 
            id,
          },
        }),

        await categoryproduct.destroy({
          where: {
            idProduct: id,
          },
        });
    
        res.send({
          status: "success",
          data: {
              id: id
          },
        });
      } catch (error) {
        console.log(error);
        res.send({
          status: "failed",
          message: "server error",
        });
      }
};