const express = require("express");
const RewardController = require("./controllers/rewardController");
const SubmissionController = require("./controllers/submissionController");
const ChallengeController = require("./controllers/challengeController");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/rewards", RewardController.getRewards);
app.get("/challenges", ChallengeController.getChallenges);
app.get("/challenges/:id", ChallengeController.getChallenge);
app.post("/challenges", ChallengeController.addChallenge);
app.patch("/challenge/:id/end", ChallengeController.endChallenge);
app.get("/submissions/", SubmissionController.getSubmissions);
app.get("/submissions/:id", SubmissionController.getSubmission);
app.post("/submissions/:id", SubmissionController.addSubmission);
app.patch("/submissions/:id/approve", SubmissionController.approveSubmission);
app.patch("/submissions/:id/reject", SubmissionController.rejectSubmission);

app.listen(port, () => {
  console.log(`LISTENING TO PORT ${port}`);
});
