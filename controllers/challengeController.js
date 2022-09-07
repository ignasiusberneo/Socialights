const axios = require("axios");

class ChallengeController {
  static async getChallenges(req, res) {
    try {
      const response = await axios.get("http://localhost:3004/challenges");
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getChallenge(req, res) {
    try {
      const { id } = req.params;
      const response = await axios.get(
        `http://localhost:3004/challenges/${id}`
      );
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async addChallenge(req, res) {
    try {
      const { title, brief, budget } = req.body;

      await axios.post("http://localhost:3004/challenges", {
        title,
        brief,
        budget: Number(budget),
        remainingBudget: Number(budget),
        status: "Ongoing",
      });
      res.status(201).json({ message: "Challenge created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async endChallenge(req, res) {
    try {
      const { id } = req.params;
      await axios.patch(`http://localhost:3004/challenges/${id}`, {
        status: "Ended",
      });
      res
        .status(201)
        .json({ message: "Challenge status has been changed to Ended" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = ChallengeController;
