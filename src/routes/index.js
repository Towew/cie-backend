const express = require('express');

const router = express.Router();

/* Import Middlewares */
const { auth } = require('../middlewares/auth.js');
const { uploadFile } = require('../middlewares/uploadFile.js');


/* Import controllers */

//Auth Controller
const { 
    regUser,
    logUser,
    checkAuth
} = require('../controllers/auth.js');

//Product Controller
const { 
    addProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.js');

//Category Controller
const { 
    addCategory, 
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory, 
} = require('../controllers/category.js');

//Transaction Controller
const { 
    addTransaction, 
    getTransactions, 
    notification
} = require('../controllers/transaction.js');

const { getProfile } = require('../controllers/profile.js');

// Route Auth
router.post("/register", regUser);
router.post("/login", logUser);
router.get("/check-auth", auth, checkAuth)

// Route Profile
router.get("/profile", auth, getProfile)

// Route Product
router.post("/product", auth, uploadFile('image'), addProduct);
router.get("/products", auth, getProducts);
router.get("/product/:id", auth, getProduct);
router.patch("/product/:id", auth, uploadFile('image'), updateProduct);
router.delete("/product/:id", auth, deleteProduct);
/* Tambahkan uploadFile('image') pada route untuk mengakses multer */

// Route Category
router.post("/category", auth, addCategory);
router.get("/categories", auth, getCategories);
router.get("/category/:id", auth, getCategory);
router.patch("/category/:id", auth, updateCategory);
router.delete("/category/:id", auth, deleteCategory);

// Route Transaction
router.post("/transaction", auth, addTransaction);
router.get("/transactions", auth, getTransactions);
router.post("/notification", notification);

module.exports = router;


/* const { 
    addUsers,
    getUsers,
    getUser,
    updateUser,  
    deleteUser
} = require('../controllers/user');

router.post("/user", addUsers);
router.get("/users", getUsers);
router.get("/user/:id", getUser);
router.patch("/user/:id", updateUser);
router.delete("/user/:id", deleteUser); */

/* //Mengambil fungsi dari folder controllers
const {
    getTodos,
    getTodo,
    addTodo,
    updateTodo,
    deleteTodo,
  } = require("../controllers/todo");

//Mengambil fungsi user dari folder controllers
const {
    addUsers,
    getUsers, 
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/user.js');

// Membuat route baru
router.get("/todos", getTodos);
router.get("/todo/:id", getTodo);
router.post("/todo", addTodo);
router.patch("/todo/:id", updateTodo);
router.delete("/todo/:id", deleteTodo);

//Route user
router.post("/user", addUsers);
router.get("/users", getUsers);
router.get("/user/:id", getUser);
router.patch("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);
 */