const db = require('../config/db')

const loadDashboard = async (req, res) => {
    try {
        // Fetch total users
        const [userCountResult] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const totalUsers = userCountResult[0].totalUsers;

        // Fetch total orders
        const [orderCountResult] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
        const totalOrders = orderCountResult[0].totalOrders;

        // Render admin dashboard with user and order counts
        res.render('dashboard', { totalUsers, totalOrders });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.render('error', { message: 'An error occurred while fetching admin data.' });
    }
}

const loadAddCategory = async (req, res) => {
    try {
        // Fetch all categories from the database
        const [rows] = await db.query('SELECT * FROM categories');

        // Render the categories page with the fetched categories
        res.render('category', { categories: rows,message:'' });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.render('category', {
            message: 'An error occurred while fetching categories.',
            categories: []
        });
    }
}

const addCategory = async (req, res) => {
    const { categoryName } = req.body;

    try {
        // Check if the category already exists
        const [existingCategory] = await db.query('SELECT * FROM categories WHERE name = ?', [categoryName]);

        if (existingCategory.length > 0) {
            // Category already exists; handle this case (e.g., send an error message)
            return res.render('category', { 
                message: 'Category already exists.',
                categories: existingCategory // Pass existing categories for display
            });
        }

        // Save the new category to the database
        await db.query('INSERT INTO categories (name) VALUES (?)', [categoryName]);

        // Redirect back to categories page after saving
        res.redirect('/admin/category');
    } catch (error) {
        console.error('Error saving category:', error);
        res.render('categories', { 
            message: 'An error occurred while saving the category.',
            categories: [] // Pass an empty array to render the page
        });
    }
}

const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);

        res.redirect('/admin/category');
    } catch (error) {
        console.error('Error deleting category:', error);
        res.render('categories', { 
            message: 'An error occurred while deleting the category.',
            categories: []
        });
    }
}

const loadUserManagement =  async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users'); 

        res.render('user-management', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('user-management', { 
            message: 'An error occurred while fetching users.',
            users: []
        });
    }
}

const deleteUser =  async (req, res) => {
    const userId = req.params.id;

    try {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        res.redirect('/admin/user-management');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.render('user-management', { 
            message: 'An error occurred while deleting the user.',
            users: [] 
        });
    }
}

module.exports = {
    loadDashboard,
    loadAddCategory,
    addCategory,
    deleteCategory,
    loadUserManagement,
    deleteUser,
}