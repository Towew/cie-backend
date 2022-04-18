'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     await queryInterface.bulkInsert(
      "users",
      [
        {
          email: "admin1@mail.com",
          password:
            "$2a$10$K4uVVYceseuCsDO/qp0XKuCQRORl2d015heQXkVorVEkl8zh5WzEW", //admin123
          name: "admin 1",
          status: "admin",
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
