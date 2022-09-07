const axios = require("axios");
const e = require("express");

class SubmissionController {
  static async getSubmissions(req, res) {
    try {
      const response = await axios.get("http://localhost:3004/submissions");
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async getSubmission(req, res) {
    try {
      const { id } = req.params;
      let response = await axios.get(`http://localhost:3004/submissions/${id}`);

      const reward = await axios.get("http://localhost:3004/rewards");

      let currentReward;

      for (let i = 0; i < reward.data.length; i++) {
        if (response.data.totalViews >= reward.data[i].view) {
          currentReward = reward.data[i];
        }
      }

      if (!currentReward) {
        currentReward = { id: 0, reward: 0 };
      }

      response.data.tier = currentReward.id;
      response.data.reward = currentReward.reward;

      res.status(200).json(response.data);
    } catch (error) {}
  }

  static async addSubmission(req, res) {
    try {
      const { id } = req.params;
      const { participant, view } = req.body;

      if (!participant || !view) {
        throw { name: "BAD_REQUEST" };
      }

      const submissions = await axios.get("http://localhost:3004/submissions");

      let check = true;

      for (let i = 0; i < submissions.data.length; i++) {
        if (submissions.data[i].ChallengeId === Number(id)) {
          if (
            submissions.data[i].participant === participant &&
            submissions.data[i].status !== "Rejected"
          ) {
            check = false;
            break;
          }
        }
      }

      if (!check) {
        throw { name: "DUPLICATE" };
      }

      const challenge = await axios.get(
        `http://localhost:3004/challenges/${id}`
      );
      if (challenge.data.status === "ENDED") {
        throw { name: "END" };
      }

      await axios.post("http://localhost:3004/submissions", {
        participant,
        totalViews: Number(view),
        ChallengeId: Number(id),
        status: "Waiting Approval",
      });

      res.status(201).json("Success");
    } catch (error) {
      switch (error.name) {
        case "BAD_REQUEST":
          res.status(400).json({ message: "Please fill all data" });
          break;
        case "DUPLICATE":
          res.status(400).json({
            message: "You are already submit, please wait for approval",
          });
          break;
        case "END":
          res.status(400).json({ message: "This challenge has been ended" });
          break;
        default:
          res.status(500).json({ message: "Internal Server Error" });
      }
      console.log(error);
    }
  }

  static async rejectSubmission(req, res) {
    try {
      const { id } = req.params;

      const response = await axios.get(
        `http://localhost:3004/submissions/${id}`
      );

      if (response.data.status === "Approved") {
        throw { name: "APPROVED" };
      }

      await axios.patch(`http://localhost:3004/submissions/${id}`, {
        status: "Rejected",
      });

      res
        .status(201)
        .json({ message: "Submission status has been change to Rejected" });
    } catch (error) {
      if (error.name === "APPROVED") {
        res.status(400).json({ message: "This submission has been approved" });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async approveSubmission(req, res) {
    try {
      const { id } = req.params;
      const submission = await axios.get(
        `http://localhost:3004/submissions/${id}`
      );
      if (submission.data.status === "Approved") {
        throw { name: "APPROVED" };
      } else if (submission.data.status === "Rejected") {
        throw { name: "REJECTED" };
      }

      const reward = await axios.get("http://localhost:3004/rewards");

      let currentReward;
      for (let i = 0; i < reward.data.length; i++) {
        if (submission.data.totalViews >= reward.data[i].view) {
          currentReward = reward.data[i].reward;
        }
      }

      if (!currentReward) {
        currentReward = 0;
      }

      const challenge = await axios.get(
        `http://localhost:3004/challenges/${submission.data.ChallengeId}`
      );

      if (challenge.data.status === "Ended") {
        throw { name: "ENDED" };
      }

      if (challenge.data.remainingBudget < currentReward) {
        await axios.patch(
          `http://localhost:3004/challenges/${submission.data.ChallengeId}`,
          { status: "Ended" }
        );
        res.status(201).json({
          message:
            "Reward exceeds remaining budget, challenge status has been changed to ended",
        });
      } else {
        await axios.patch(
          `http://localhost:3004/challenges/${submission.data.ChallengeId}`,
          { remainingBudget: challenge.data.remainingBudget - currentReward }
        );
        await axios.patch(`http://localhost:3004/submissions/${id}`, {
          status: "Approved",
        });
        res
          .status(201)
          .json({ message: "Submission status has been change to Approved" });
      }
    } catch (error) {
      switch (error.name) {
        case "APPROVED":
          res
            .status(400)
            .json({ message: "This submission has been approved" });
        case "REJECTED":
          res
            .status(400)
            .json({ message: "This submission has been rejected" });
        case "ENDED":
          res.status(400).json({ message: "This challenge has been ended" });
        default:
          res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}

module.exports = SubmissionController;
