/* ==========================================================================
   validate.js , checking a form before it is sent.

   Two kinds of checking exist and they are not alternatives:

     Client side, here. Fast, and it saves a reader a round trip to be told
     something they could have been told immediately. It is a courtesy.

     Server side, in the API. Slower, and it is the only one that counts. A
     browser is under the reader's control; anybody can open the developer
     tools and remove an attribute, or send a request without a page at all.

   So nothing here is a security control. The value of this file is that a
   person who mistypes an email address learns it in the same second rather
   than after a request, and that the reason appears next to the field they
   have to fix rather than at the top of the page.

   Native HTML validation does most of this already: required, type="email",
   minlength and pattern are checked by the browser without a line of script.
   This file exists because the browser's own error bubbles cannot be styled,
   vanish on their own, and are not announced by every screen reader. The
   checking is left to the browser; the reporting is taken over.
   ========================================================================== */

const validate = (function () {

  /* Messages the browser would give are technical: "Please match the
     requested format." A person needs to be told what to do instead. */
  const MESSAGES = {
    valueMissing:    "This field is required.",
    typeMismatch:    "Check this is a valid email address.",
    tooShort:        "This is too short.",
    tooLong:         "This is too long.",
    patternMismatch: "Check the format of this value.",
    rangeUnderflow:  "This number is too small.",
    rangeOverflow:   "This number is too large.",
  };

  function messageFor(input) {
    // A page may give a field its own wording with data-error, which beats
    // anything generic we could write here.
    const custom = input.dataset.error;
    const v = input.validity;
    for (const key of Object.keys(MESSAGES)) {
      if (v[key]) return custom || MESSAGES[key];
    }
    return custom || "Check this value.";
  }

  /* Shows or clears the error beneath one field.

     aria-invalid tells assistive technology the field is wrong, and
     aria-describedby points at the sentence saying why, so a screen reader
     reads the reason when the field takes focus. Colour alone would tell a
     colour blind reader nothing. */
  function report(input, message) {
    const field = input.closest(".field") || input.parentNode;
    let error = field.querySelector(".field__error");

    if (!message) {
      if (error) error.remove();
      input.removeAttribute("aria-invalid");
      return;
    }

    if (!error) {
      error = document.createElement("p");
      error.className = "field__error";
      error.id = (input.id || "field") + "-error";
      field.appendChild(error);
    }
    error.textContent = message;
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby",
      [input.dataset.hint, error.id].filter(Boolean).join(" "));
  }

  /* Checks one field. Returns true if it is acceptable. */
  function field(input) {
    const value = input.value.trim();

    // A rule the browser cannot express: a value that is only spaces is
    // empty as far as a person is concerned.
    if (input.required && value === "") {
      report(input, input.dataset.error || MESSAGES.valueMissing);
      return false;
    }

    // minlength is checked here rather than left to the browser, because the
    // browser applies it only once the value has been edited by hand. A value
    // set by script, or restored by the browser itself, passes silently.
    const min = Number(input.getAttribute("minlength") || 0);
    if (min > 0 && value !== "" && value.length < min) {
      report(input, input.dataset.error || MESSAGES.tooShort);
      return false;
    }

    const ok = input.checkValidity();
    report(input, ok ? null : messageFor(input));
    return ok;
  }

  /* Checks a whole form and reports every problem at once.

     Every problem, not the first: stopping at the first makes somebody fix
     one thing, submit, and be told about the next, which is the worst way to
     fill in a form. Focus moves to the first bad field so a keyboard user is
     taken to the work rather than left hunting for it. */
  function form(formElement) {
    const inputs = Array.from(
      formElement.querySelectorAll("input, select, textarea")
    ).filter(el => !el.disabled && el.type !== "submit" && el.type !== "hidden");

    let firstBad = null;
    inputs.forEach(input => {
      if (!field(input) && !firstBad) firstBad = input;
    });

    if (firstBad) {
      firstBad.focus();
      if (typeof announce === "function") {
        announce("The form has errors. " + messageFor(firstBad));
      }
      return false;
    }
    return true;
  }

  /* Attaches the usual behaviour to a form.

     Fields are checked when they lose focus, not on every keystroke: telling
     somebody their email is invalid while they are still typing the first
     letter of it is noise. Once a field has been marked wrong it is
     re-checked as they type, so the error clears the moment it is fixed. */
  function attach(formElement) {
    formElement.setAttribute("novalidate", "");   // we report, not the browser

    formElement.querySelectorAll("input, select, textarea").forEach(input => {
      input.addEventListener("blur", () => field(input));
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") field(input);
      });
    });
  }

  /* Two values that must match, such as a new password and its confirmation.
     The browser has no attribute for this. */
  function mustMatch(first, second, message) {
    const same = first.value === second.value;
    report(second, same ? null : (message || "These two do not match."));
    return same;
  }

  return { field, form, attach, mustMatch, report };
})();
