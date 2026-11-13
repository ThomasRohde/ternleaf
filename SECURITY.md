# Security

## Report a problem

Report a vulnerability in private. On GitHub, open the **Security** tab of this repository and choose **Report a vulnerability**. Do not open a public issue.

Include the steps to reproduce the problem, the effect, and the commit that you tested. There is no fixed response time, but each report gets an answer.

## What Ternleaf protects

- The document and its history stay on the author's computer.
- The loopback host binds to `127.0.0.1`, requires a per-canvas bearer token for every API call, and checks the `Host` and `Origin` headers.
- A canvas opens only a `.docx` file inside the project or the session's working directory.
- No canvas action can edit the document. Copilot reads the document only through the canvas actions, and the canvas tells the author each time. With `"chat": false` in `.ternleaf/canvas.json`, Copilot reads only what the author shares from the canvas for one request.
- A tool call by Copilot that writes a file in `.ternleaf`, or the `.docx` file that a canvas shows, needs the author's approval.

A way around one of these points is a vulnerability.

## Out of scope

- The security of GitHub Copilot, the Copilot SDK and OpenDoc. Report those to their own projects.
- What the model does with text that the author chose to share.
