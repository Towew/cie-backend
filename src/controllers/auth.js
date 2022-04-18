const { user } = require('../../models');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* Bagian Registrasi */

// Tambah user reg
exports.regUser = async (req, res) => {
    try {

        let data = req.body;

        if(!data.status){
            data = {
                ...data,
                status: 'customer',
            };
        };

        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8),
            status: Joi.string()
        });

        const { error } = schema.validate(data);

        if(error){
            return res.status(400).send({
                error: {
                    message: error.details[0].message
                }
            });
        };

        const emailAlready = await user.findOne({
            where: {
                email: data.email,
            }
        });

        if(emailAlready){
            return res.send({
                error: {
                    message: `Account already existed`
                }
            });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

       const newUser =  await user.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            status: data.status
        });

        const payload = { 
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            status: newUser.status 
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY);

        res.status(201).send({
            status: 'Success',
            data: {
                user: {
                    name: newUser.name,
                    email: newUser.email,
                    token: token
                }
            },
        });
        
    } catch (error) {
        console.log(error)
        res.send({
            status: 'Failed',
            message: 'Server Error'
        });
    }
};

/* Bagian Login */

//Login checked
exports.logUser = async (req, res) => {
    try {

        const data = req.body;

        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        const { error } = schema.validate(data);

        if(error){
            return res.status(400).send({
                error: {
                    message: error.details[0].message
                }
            });
        };

        const accountExist = await user.findOne({
            where: {
                email: data.email,
            }
        });

        if(!accountExist){
            return res.status(400).send({
                error: {
                    message: `Email or Password is not Matching`
                }
            });
        };

        const isValid = await bcrypt.compare(data.password, accountExist.password);

        if(!isValid) {
            return res.status(400).send({
                error: {
                    message: `Email or Password is not Matching`
                }
            });
        };

        const payload = { 
            id: accountExist.id,
            name: accountExist.name,
            email: accountExist.email,
            status: accountExist.status 
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY);

        res.send({
            status: 'Success',
            data: {
                user: {
                    id: accountExist.id,
                    name: accountExist.name,
                    email: accountExist.email,
                    status: accountExist.status,
                    token
                }
            },
        });
        
    } catch (error) {
        console.log(error)
        res.send({
            status: 'Failed',
            message: 'Server Error'
        });
    }
};

exports.checkAuth = async (req, res) => {
    try {
      const id = req.user.id;
  
      const dataUser = await user.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });
  
      if (!dataUser) {
        return res.status(404).send({
          status: "failed",
        });
      }
  
      res.send({
        status: "success...",
        data: {
          user: {
            id: dataUser.id,
            name: dataUser.name,
            email: dataUser.email,
            status: dataUser.status,
          },
        },
      });
    } catch (error) {
      console.log(error);
      res.status({
        status: "failed",
        message: "Server Error",
      });
    }
  };