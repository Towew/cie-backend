const { user, profile, chat } = require('../../models')
const jwt = require('jsonwebtoken');
const {Op} = require('sequelize');

const connectedUser = {};

const socketIo = (io) => {

  io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      next();
    } else {
      next(new Error('Not Authorized'));
    }
  });

    io.on('connection', (socket) => {
        console.log('client connect:', socket.id);

        const token = socket.handshake.auth.token;
        const tokenKey = process.env.SECRET_KEY;
        const userId = jwt.verify(token, tokenKey).id;

        connectedUser[userId] = socket.id;

        socket.on('load admin contact', async () => {
          try {
          const data = await user.findAll({
            include: {
              model: profile,
              as: 'profile',
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'password']
            },
            where: {
              status: 'admin'
            }
          });
          
          socket.emit('admin contact', data)
          } catch (error) {
            console.log(error)
          }
        })

        socket.on('load customer contact', async () => {
          try {
            const data = await user.findAll({
              include: [
                {
                  model: profile,
                  as: 'profile',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                  },
                },
                {
                  model: chat,
                  as: 'recipientMessage',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'idRecipient', 'idSender'],
                  },
                },
                {
                  model: chat,
                  as: 'senderMessage',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'idRecipient', 'idSender'],
                  },
                },
              ],
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'password'],
              },
              where: {
                status: 'customer',
              },
            });
    
            socket.emit('customer contact', data);
          } catch (error) {
            console.log(error);
          }
        });

        socket.on('load messages', async (payload) => {
          try {
            const idRecipient = payload;
            const idSender = userId;
    
            let data = await chat.findAll({
              where: {
                idRecipient: {
                  [Op.or]: [idRecipient, idSender],
                },
                idSender: {
                  [Op.or]: [idRecipient, idSender],
                },
              },
              include: [
                {
                  model: user,
                  as: 'recipient',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'password'],
                  },
                },
                {
                  model: user,
                  as: 'sender',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'password'],
                  },
                },
              ],
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'idRecipient', 'idSender'],
              },
              order: [['createdAt', 'ASC']],
            });
    
            data = JSON.parse(JSON.stringify(data));
    
            socket.emit('messages', data);
          } catch (error) {
            console.log(error);
          }
        });

        socket.on('send message', async (payload) => {
          try {
            const idSender = userId;
            const { idRecipient, message } = payload;
    
            const data = { idSender, idRecipient, message };
    
            await chat.create(data);
    
            io.to(socket.id).to(connectedUser[idRecipient]).emit('new message');
          } catch (error) {
            console.log(error);
          }
        });

      socket.on('disconnect', () => {
          console.log('client disconnect')
      })

      });
};

module.exports = socketIo