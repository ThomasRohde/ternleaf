# House rules

Copy this file to `ternleaf.rules.md` in the project folder and make it yours. Copilot gets these rules with every read, follows them in its proposals and checks your documents against them.

Write rules that a reviewer can check. Keep the list short.

1. Start a decision document with the recommendation and the decision that you ask for.
2. Give every number a source and a date.
3. Name an owner and a date for every action.
4. Write a term in full the first time, with its short form in brackets.
5. Use one term for one thing in the whole document.
6. Keep a sentence under 25 words.

Ternleaf checks the rules in this block itself, after every change, without Copilot. Remove the lines that you do not want.

```ternleaf
max-pages: 2
max-sentence-words: 25
require-heading: Recommendation
avoid: utilize => use
avoid: in order to => to
```
