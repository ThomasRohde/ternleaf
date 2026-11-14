"""Write examples/house-rules-tour.docx, a tour of the house rules.

The tour needs the example rules: a copy of examples/ternleaf.rules.example.md
with the name ternleaf.rules.md in the project folder. The first page says
how to make the copy and what to do. The pages after it are a short paper that
breaks the example rules in ways that the author can see:

- 4 of the 5 checks in the ternleaf block fail: the length (3 pages, the limit
  is 2), one sentence longer than 25 words, the missing heading
  "Recommendation" and a word to avoid.
- Copilot has three things to leave a remark about: a number with no source,
  an action with no owner, and two dates that disagree.
- The appendix of the paper can go, so that "fit to two pages" has a cut.

The instructions on the first page must not break a check themselves: keep
each sentence at 25 words or less, do not write the words that the rules
avoid, and do not put "Recommendation" in a heading.

    python -m pip install python-docx
    python scripts/make-tour.py
"""
import importlib.util
from pathlib import Path

root = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("make_welcome", root / "scripts" / "make-welcome.py")
welcome = importlib.util.module_from_spec(spec)
spec.loader.exec_module(welcome)

PAGE_BREAK = ("Break", "")

CONTENT = [
    ("Title", "House rules tour"),
    ("Lead", "The paper in this document breaks the house rules of a team on purpose. Use it to see how Ternleaf checks a document, how Copilot leaves remarks and how a fit to a length is measured."),

    ("Heading 1", "Before you start: switch on the example rules"),
    ("Normal", "House rules are a Markdown file in the project folder, which is the folder that you opened in the Copilot app. Copy the example file from the examples folder of Ternleaf to the name that Ternleaf reads:"),
    ("Chat", "ternleaf.rules.example.md  →  ternleaf.rules.md"),
    ("Normal", "You can also type this in the Copilot chat: Copy the Ternleaf file ternleaf.rules.example.md to ternleaf.rules.md in the project folder."),
    ("Normal", "After a few seconds, the top of the Review pane shows **House rules: 4 of 5 checks fail**. You do not have to reload the canvas."),

    ("Heading 1", "1. Read the checks"),
    ("Normal", "The rules file has a block of checks. Ternleaf runs them itself after every change, without Copilot. Each failing check says what is wrong: the length, a long sentence, a missing heading and a word to avoid."),
    ("Normal", "Fix one yourself. In the paper, change the heading Our view to Recommendation. That check passes at once."),

    ("Heading 1", "2. Review against the house rules"),
    ("Normal", "Type this in the Copilot chat:"),
    ("Chat", "Review this document against the house rules."),
    ("Normal", "Copilot follows every rule in the file, also the rules that Ternleaf cannot check. Where new text solves a problem, it suggests a change. Where only you have the facts, it leaves a remark."),
    ("Normal", "The paper has a number with no source, an action with no owner and two dates that disagree. **Add as comment** keeps a remark as a Word comment. **Done** closes it."),

    ("Heading 1", "3. Fit to two pages"),
    ("Normal", "The rules allow two pages, and this document has three. Type this in the chat:"),
    ("Chat", "Fit this document to two pages."),
    ("Normal", "Copilot tries its cuts on a copy, and the engine counts the real pages before you see a suggestion. The appendix of the paper is a good cut. When you accept the cuts, the length check passes."),

    ("Heading 1", "4. Keep the reasons"),
    ("Normal", "Open the History tab and choose **Download the change record**. The file lists each change that you accepted, with the request and the reason from Copilot."),
    ("Small", "To switch the rules off, rename or delete ternleaf.rules.md. The guide docs/Install.md in the Ternleaf repository describes each check."),

    PAGE_BREAK,
    ("Title", "A shared review checklist"),
    ("Lead", "A proposal to the policy board, for decision."),

    ("Heading 1", "Summary"),
    ("Normal", "Each reviewer in the policy team checks a document against a personal list. The lists are different, so authors get different comments on the same problem. We propose one shared checklist for all reviews."),

    ("Heading 1", "Our view"),
    ("Normal", "We propose that the policy team starts to use the shared checklist on 1 March. We ask the board to approve the checklist and two days of training for the reviewers."),

    ("Heading 1", "Background"),
    ("Normal", "Last year, a review of a policy document took 14 working days on average."),
    ("Normal", "Because each reviewer uses a different list and because the lists change from year to year without notice to the authors, many documents go back to their authors two or three times before the approval, which costs time for everyone."),
    ("Normal", "Two other teams utilize a shared checklist already. Their authors say that they know what a reviewer looks for before they start to write."),

    ("Heading 1", "The checklist"),
    ("Normal", "The checklist has twelve questions in three groups: the decision, the facts and the language. Each question has one answer: yes, no or not applicable. A reviewer adds a comment only for a no."),
    ("Normal", "The checklist is a page in the team handbook. A change to the checklist needs the approval of the head of the team."),

    ("Heading 1", "Plan"),
    ("Normal", "The pilot starts on 1 April with two reviewers and ten documents. After the pilot, the team decides if it changes the questions."),
    ("Normal", "The template for policy documents must have a link to the checklist before the pilot starts."),

    ("Heading 1", "Costs"),
    ("Normal", "The training takes two days for each of the six reviewers. The checklist itself costs nothing, because it is a page in the handbook that the team already has."),

    ("Heading 1", "Risks"),
    ("Normal", "Reviewers can treat the checklist as the whole review and stop to read for sense. The training shows how the checklist and a careful reading work together."),

    ("Heading 1", "Appendix: earlier attempts"),
    ("Normal", "The team tried a shared list once before. The list had forty questions, and the reviewers used it for two months. Then each reviewer went back to a personal list, because the shared list took too long to fill in."),
    ("Normal", "A second attempt gave each document type its own list. There were too many lists to keep up to date, and after the team changed, nobody owned them. The proposal in this paper keeps one short list with one owner."),
    ("Normal", "The lessons from both attempts are in the review of the team process. That review also lists the questions that reviewers asked most often, which are the source of the twelve questions in the checklist."),
]

if __name__ == "__main__":
    welcome.build(CONTENT, root / "examples" / "house-rules-tour.docx", "House rules tour",
                  "A Ternleaf example that breaks the example house rules on purpose.")
