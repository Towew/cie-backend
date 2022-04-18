const { user, transaction, product, profile } = require('../../models')

const midtransClient = require('midtrans-client');

const convertRupiah = require('rupiah-format');

exports.addTransaction = async (req, res) => {
    try {

        let data = req.body;
        data = {
        id: parseInt(data.idProduct + Math.random().toString().slice(3, 8)),
        ...data,
        idBuyer: req.user.id,
        status: 'pending',
        };

    const newData = await transaction.create(data);

    const buyerData = await user.findOne({
        include: {
          model: profile,
          as: 'profile',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'idUser'],
          },
        },
        where: {
          id: req.user.id,
        },
        attributes: {
          exclude: ['updatedAt', 'password'],
        },
      });

      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      let parameter = {
        transaction_details: {
          order_id: newData.id,
          gross_amount: newData.price,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          full_name: buyerData?.name,
          email: buyerData?.email,
          phone: buyerData?.profile?.phone,
        },
      };

    const payment = await snap.createTransaction(parameter);

    res.send({
        status: 'pending',
        message: 'Pending transaction payment gateway',
        payment,
        product: {
          id: data.idProduct,
        },
      });

        /* let data = req.body;
        
        data = {
            ...data,
            idBuyer: req.user.id,
            status: 'success',
          };
      
          await transaction.create(data);
      
          res.send({
            status: "success",
            message: "Add transaction finished",
        }); */
        
        /* data = {
            ...data,
            idBuyer: req.user.id
        }

        const dataproduct = await product.findOne({
            attributes:{
                exclude:['name','desc','image','qty','createdAt','updatedAt']
            },
            where:{
                id: data.idProduct,
            },
          });

          const dataseller = await user.findOne({
            attributes:{
                exclude:['email','password','createdAt','updatedAt','name','status']
            },
            where:{
                id: dataproduct.idUser,
            },
          });

          if(!data.price){
            data = {
                ...data,
                price: dataproduct.price,
                status: "success"
            };
        };

        await transaction.create({
            idProduct: data.idProduct,
            idBuyer: data.idBuyer,
            idSeller: dataseller.id,
            price: data.price,
            status: data.status
        });

        res.send({
            status: 'success',
            data: {
                transaction: {
                    id: data.id,
                    idProduct: data.idProduct,
                    idBuyer: buyer.id,
                    idSeller: dataseller.id,
                    price: data.price
                }
            }
        }) */

    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error',
        })
    }
}

exports.getTransactions = async (req, res) => {
    try {
        let data = await transaction.findAll({
            where: {
                idBuyer: req.user.id,
            },
            order: [['createdAt', 'DESC']],
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'idBuyer', 'idSeller', 'idProduct']
            },
            include: [
                {
                    model: product,
                    as: 'product',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'idUser', 'qty',]
                    }
                },
                {
                    model: user,
                    as: 'buyer',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'status']
                    }
                },
                {
                    model: user,
                    as: 'seller',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'status']
                    }
                },
            ]
        })

        data = JSON.parse(JSON.stringify(data));

        data = data.map((item) => {
          return {
            ...item,
            product: {
              ...item.product,
              image: process.env.PATH_FILE + item.product.image,
            },
          };
        });

        res.send({
            status: 'success',
            data: {
                transaction: data
            }
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}

const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

const core = new midtransClient.CoreApi();

core.apiConfig.set({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

exports.notification = async (req, res) => {
    try {
      const statusResponse = await core.transaction.notification(req.body);
  
      console.log('------- Notification --------- ✅');
      console.log(statusResponse);
  
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
  
      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          // TODO set transaction status on your database to 'challenge'
          // and response with 200 OK
          updateTransaction('pending', orderId);
          res.status(200);
        } else if (fraudStatus == 'accept') {
          // TODO set transaction status on your database to 'success'
          // and response with 200 OK
          updateProduct(orderId);
          updateTransaction('success', orderId);
          res.status(200);
        }
      } else if (transactionStatus == 'settlement') {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        updateTransaction('success', orderId);
        res.status(200);
      } else if (
        transactionStatus == 'cancel' ||
        transactionStatus == 'deny' ||
        transactionStatus == 'expire'
      ) {
        // TODO set transaction status on your database to 'failure'
        // and response with 200 OK
        updateTransaction('failed', orderId);
        res.status(200);
      } else if (transactionStatus == 'pending') {
        // TODO set transaction status on your database to 'pending' / waiting payment
        // and response with 200 OK
        updateTransaction('pending', orderId);
        res.status(200);
      }
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  };
  
  const updateTransaction = async (status, transactionId) => {
    await transaction.update(
      {
        status,
      },
      {
        where: {
          id: transactionId,
        },
      }
    );
  };
  
  const updateProduct = async (orderId) => {
    const transactionData = await transaction.findOne({
      where: {
        id: orderId,
      },
    });
    const productData = await product.findOne({
      where: {
        id: transactionData.idProduct,
      },
    });
    const qty = productData.qty - 1;
    await product.update({ qty }, { where: { id: productData.id } });
};

