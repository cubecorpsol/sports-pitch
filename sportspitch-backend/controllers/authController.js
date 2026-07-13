const { signToken } = require('../utils/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      return res.status(500).json({
        success: false,
        error: 'Admin credentials are not configured'
      });
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect username or password'
      });
    }

    const token = signToken({ role: 'admin', username });
    res.json({ success: true, token, username });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
