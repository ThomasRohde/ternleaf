# Security

## Report a problem

Report a vulnerability in private. On GitHub, open the **Security** tab of this repository and choose **Report a vulnerability**. Do not open a public issue.

Include the steps to reproduce the problem, the effect, and the commit that you tested. There is no fixed response time, but each report gets an answer.

## What Ternleaf protects

- The document and its history stay on the author's computer.
- The loopback host binds to `127.0.0.1`, requires a per-canvas bearer token for every API call, and checks the `Host` and `Origin` headers.
- A canvas opens only a `.docx` file inside the project or the session's working directory.
- Copilot reads only the passage or the document text that the author shares for one request. No canvas action can edit the document.

A way around one of these points is a vulnerability.

## Out of scope

- The security of GitHub Copilot, the Copilot SDK and OpenDoc. Report those to their own projects.
- What the model does with text that the author chose to share.
