const axios = require("axios");

class RewardController {
  static async getRewards(req, res) {
    try {
      const response = await axios.get("http://localhost:3004/rewards");
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = RewardController;
