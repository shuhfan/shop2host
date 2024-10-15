const db = require('../config/db')
const bcrypt = require('bcrypt')
const loadDashboard = async (req, res) => {
    try {
        // Fetch total users
        const [userCountResult] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const totalUsers = userCountResult[0].totalUsers;

        // Fetch total orders
        const [orderCountResult] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
        const totalOrders = orderCountResult[0].totalOrders;

        const [result] = await db.query('SELECT SUM(amount) AS total_amount FROM orders');
        const totalAmount = result[0].total_amount || 0;

        // Render admin dashboard with user and order counts
        res.render('dashboard', { totalUsers, totalOrders, totalAmount });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.render('error', { message: 'An error occurred while fetching admin data.' });
    }
}

const loadAdminLogin = (req,res,next)=>{
    try {
        res.render('adminLogin',{message:''})
    } catch (error) {
        console.log(error.message);
        
    }
}

const signOut = (req, res, next) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error while signing out:', err);
          return res.status(500).send('Error occurred during signout.');
        }
  
        // Clear the cookie
        res.clearCookie('connect.sid'); // This clears the session ID cookie
        res.redirect('/admin/login'); // Redirect to login page or any other page after signout
      });
    } catch (error) {
      console.log(error.message);
  
    }
  }

const adminLogin = async (req, res) => {
    const { email, password } = req.body; // Assuming email and password are sent in the request body

    try {
        // Step 1: Fetch user from the database
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(401).render('adminLogin', { message: 'Email and Password are required.' });
        }

        const user = results[0];

        // Step 2: Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).render('adminLogin',{ message: 'Access denied. Admins only.' });
        }

        // Step 3: Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).render('adminLogin',{ message: 'Invalid email or password.' });
        }

        // Step 4: Set session variables
        req.session.admin_id = user.id; // Store user ID in session
        req.session.isAdmin = true; // Set admin flag in session

        // Step 5: Redirect to admin dashboard or send success response
        res.redirect('/admin')
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).render('adminLogin',{message: 'Internal Server Error' });
    }
};

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

const loadOrders = async(req,res,next)=>{
    try {
        const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.render('orders',{orders})
    } catch (error) {
        console.log(error.message);
        
    }
}

const updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body; // Get new status from request body

    try {
        const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Order not found');
        }

        res.status(200).render('orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
};

const loadUserManagement =  async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.*, COUNT(o.id) AS order_count 
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
        `); 
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

const loadTickets = async (req, res) => {
    try {
        const [tickets] = await db.query('SELECT * FROM tickets');

        // Render the admin tickets page with retrieved tickets
        res.render('tickets', { tickets });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).send('Internal Server Error');
    }
}

const ticketReplay = async (req, res) => {
    const ticketId = req.params.ticketId;
    const { reply } = req.body;
    const adminId = req.session.admin_id;
    try {
        const [rows] = await db.query('SELECT isAdmin FROM users WHERE id = ?', [adminId]);
        const isAdmin = rows[0].isAdmin;
        console.log(ticketId, isAdmin, reply);


        await db.query(
            'INSERT INTO replies (ticket_id, user_id, reply) VALUES (?, ?, ?)',
            [ticketId, isAdmin, reply]
        );

        await db.query(
            'UPDATE tickets SET status = ? WHERE id = ?',
            ['Answered', ticketId]
        );

        res.redirect('/admin/tickets'); // Redirect back to the tickets page
    } catch (error) {
        console.error('Error replying to ticket:', error);
        res.status(500).send('Internal Server Error');
    }
}

const openTicket =  async (req, res) => {
    const ticketId = req.params.ticketId;

    try {
        const [ticket] = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        const [replies] = await db.query('SELECT * FROM replies WHERE ticket_id = ?', [ticketId]);

        if (ticket.length > 0) {
            res.render('view-ticket', { ticket: ticket[0], replies }); 
        } else {
            res.status(404).send('Ticket not found');
        }
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        res.status(500).send('Internal Server Error');
    }
};

const changeMaintenanceMode = (req, res) => {
    const { maintenanceMode: isEnabled } = req.body;
    maintenanceMode = isEnabled; 
    res.status(200).send('Maintenance mode updated');
}

module.exports = {
    loadDashboard,
    loadAdminLogin,
    adminLogin,
    signOut,
    loadAddCategory,
    addCategory,
    deleteCategory,
    loadOrders,
    updateOrderStatus,
    loadUserManagement,
    deleteUser,
    loadTickets,
    ticketReplay,
    openTicket,
    changeMaintenanceMode,
}