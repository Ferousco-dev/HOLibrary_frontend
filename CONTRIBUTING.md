# How we work

Read this before your first commit. It is short, and every rule in it exists
because of something that has already gone wrong on a project like this one.

## The one rule

**Nobody pushes to `main`. Not once, not for a small fix, not even me.**

`main` is what is deployed. If `main` breaks, the live site breaks, and at the
defence there is nothing to show. So `main` is locked on GitHub: a direct push
is rejected by the server, not by good manners.

Work reaches `main` one way: you push a branch, you open a pull request, it is
reviewed, and it is merged.

## Your loop, every time

```bash
git checkout main
git pull                                  # start from what is deployed
git checkout -b feature/05-my-loans       # your own branch
# ... work ...
git add -A
git commit -m "Add the member loans screen"
git push -u origin feature/05-my-loans
```

Then open the pull request on GitHub and say what you built.

### Branch names

`feature/<screen>` for a screen, `fix/<what>` for a repair.

```
feature/05-my-loans        fix/hamburger-not-closing-on-escape
```

Not `test`, not `new`, not `oluwaseun-branch`. The name should say what is in it.

### Commit messages

Say **why**, not what. The diff already shows what changed.

```
Good:  Show the accession number on each loan, not just the title
       A member holds one specific copy. Two copies of the same book on
       one account are indistinguishable without it.

Bad:   update
       fixed stuff
       final version FINAL
```

One commit per idea. If you did three things, make three commits.

## Pull requests

Fill in the template. It asks for four things, and all four are needed:

1. **What screen** this is, and which task number it closes.
2. **A screenshot** of your page at desktop width, and one at phone width.
   A screenshot is the fastest possible review: I can see in two seconds
   whether the frame matches.
3. **Your accessibility check.** Run Lighthouse in Chrome DevTools
   (Lighthouse tab, tick Accessibility, Analyze) and paste the score.
   Anything below 95 needs a sentence saying what is left and why.
4. **The Ìlànà entries** you wrote. See below.

Then wait. Do not merge your own pull request; the button is disabled for you
anyway. I read it, and either merge it or leave comments. Comments are not
criticism, they are the review working.

If I ask for a change: push another commit to the *same branch*. The pull
request updates itself. Do not close it and open a new one.

## Keeping up to date

While your branch is open, other branches are being merged. Before asking for a
review, bring your branch up to date:

```bash
git checkout main
git pull
git checkout feature/05-my-loans
git merge main
```

If Git reports a conflict, do not panic and do not delete the branch. Open the
file, find the `<<<<<<<` markers, keep the correct version, remove the markers,
then `git add` the file and `git commit`. Ask me if the right answer is not
obvious; a conflict resolved wrongly is worse than one left alone.

## What never goes in a commit

- An API key, a password, or a token. Ever. If you commit one by accident, tell
  me immediately and do not just delete it in the next commit: it stays in the
  history.
- `node_modules/`, `.DS_Store`, editor settings. `.gitignore` covers these.
- A file you did not mean to touch. Read `git status` before you commit.
- Commented-out code you might want later. That is what the history is for.

## Ìlànà

Every task is logged, the same way the back end was. You write two things:

- **A decision (`DEC-`)** whenever you chose between two reasonable options:
  what you picked, what you rejected, and why.
- **A defect (`DEF-`)** whenever something was wrong and you fixed it,
  including something you found in your own work.

They go in `.ilana/`, and they are part of the report we submit. "I did not
make any decisions" is never true; it means you have not noticed them yet.
