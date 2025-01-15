export const getCurrentUser = (req, res) => {
    try {
      const user = req.user; // User attached by authMiddleware
      res.status(200).json({ user });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  