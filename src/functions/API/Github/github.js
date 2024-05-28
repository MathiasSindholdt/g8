require('../../../lib/classes.js')
const { Client, Collection, GatewayIntentBits } = require("discord.js");


function handleGithubWebhooks(express, app, callback) {
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    const router = express.Router();
    console.log('Github webhook is running');
    router.post('/github-webhook', (req, res) => {
        gr.event = req.headers['x-github-event']
        const payload = req.body;
        console.log(`Received GitHub event: ${gr.event}`);
        if (gr.event === 'push') {
            gr.mergeCommitDetected = false;
            console.log("Successful push")
            gr.branch = payload.ref.split('/').pop();
            payload.commits.forEach(commit => {
                gr.commitUrl = commit.url;
                gr.commitMessage = commit.message;
                gr.repository = payload.repository.full_name;
                gr.commitAuthor = commit.author.name;
            });
            console.log(gr.commitAuthor)
            if (!gr.distinct && !gr.mergeCommitDetected) {
                gr.mergeCommitDetected = true;
                callback(gr)
            } else {
			callback(gr);
	    }            
        }

        if (gr.event === 'pull_request') {
            console.log("New pull request detected");
            gr.action = payload.action;
            gr.pullRequest = payload.pull_request;
            gr.pullRequestUrl = gr.pullRequest.html_url;
            gr.pullRequestTitle = gr.pullRequest.title;
            gr.pullRequestAuthor = gr.pullRequest.user.login;
            gr.pullRequestMessage = gr.pullRequest.body;
            gr.reviwerName = payload.sender.login;
            gr.closeMerge = payload.pull_request.merged_at;
            gr.repository = payload.repository.full_name;
            console.log("CLOSE MERGE: " + gr.closeMerge)
            console.log(gr.reviwerName)
	        callback(gr);
        }

        if (gr.event === 'pull_request_review_comment' ) {
            console.log("New review comment detected")
            gr.commentMessage = payload.comment.body;
            gr.pullRequestCommentUrl = payload.comment.html_url;
            gr.pullRequestTitle = payload.pull_request.title;
            gr.reviewerName = payload.sender.login;
            gr.commentPath = payload.comment.path;
	        callback(gr);
        }

        if (gr.event === 'pull_request_review_thread') {
            gr.resolver = payload.sender.login;
            gr.pullRequestTitle = payload.pull_request.title;
            payload.thread.comments.forEach(comments => {
                gr.commentMessage = comments.body;
                gr.commentUrl = comments.html_url;
            });
	        callback(gr);
        }
        res.sendStatus(200);
    });

    return router;
}

module.exports = handleGithubWebhooks;
