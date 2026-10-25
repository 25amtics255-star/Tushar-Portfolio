/* ==========================================================
   Tushar Shinde - Portfolio JavaScript
   Everything is wrapped in one function so no variables
   leak into the global scope.
   ========================================================== */
(function () {
  'use strict';

  // Respect users who prefer less motion
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  /* ---------------------------------------------------------
     1. MOBILE NAVIGATION
     --------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var navLinks = document.querySelectorAll('.nav-link');

  function setMenuState(isOpen) {
    navMenu.classList.toggle('open', isOpen);
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }

  navToggle.addEventListener('click', function () {
    setMenuState(!navMenu.classList.contains('open'));
  });

  // Close the menu after a link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { setMenuState(false); });
  });

  // Close with the Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      setMenuState(false);
      navToggle.focus();
    }
  });

  /* ---------------------------------------------------------
     2. SMOOTH SCROLLING
     CSS handles most of it (scroll-behavior), but we also
     handle in-page links here so reduced-motion is respected.
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var targetId = anchor.getAttribute('href');
      if (targetId.length < 2) { return; }
      var target = document.querySelector(targetId);
      if (!target) { return; }
      event.preventDefault();
      target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      history.replaceState(null, '', targetId);
    });
  });

  /* ---------------------------------------------------------
     3. ACTIVE NAVIGATION HIGHLIGHT
     --------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');

  function updateActiveLink() {
    var scrollPosition = window.scrollY + 120; // offset for sticky header
    var currentId = 'home';

    sections.forEach(function (section) {
      if (scrollPosition >= section.offsetTop) { currentId = section.id; }
    });

    // At the very bottom of the page, highlight the last link (Contact)
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      currentId = 'contact';
    }

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('active', isActive);
      if (isActive) { link.setAttribute('aria-current', 'page'); }
      else { link.removeAttribute('aria-current'); }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink);
  updateActiveLink();

  /* ---------------------------------------------------------
     4. SHAPE AREA CALCULATOR
     --------------------------------------------------------- */
  var shapeSelect = document.getElementById('shapeSelect');
  var calcForm = document.getElementById('calcForm');
  var calcInputs = document.getElementById('calcInputs');
  var calcError = document.getElementById('calcError');
  var calcResult = document.getElementById('calcResult');
  var calcFormula = document.getElementById('calcFormula');
  var calcValue = document.getElementById('calcValue');
  var calcReset = document.getElementById('calcReset');

  // Each shape: its input fields and a function that calculates the area
  var shapes = {
    square: {
      fields: [{ id: 'side', label: 'Side' }],
      formula: 'Area = side \u00D7 side',
      area: function (v) { return v.side * v.side; }
    },
    rectangle: {
      fields: [{ id: 'length', label: 'Length' }, { id: 'width', label: 'Width' }],
      formula: 'Area = length \u00D7 width',
      area: function (v) { return v.length * v.width; }
    },
    triangle: {
      fields: [{ id: 'base', label: 'Base' }, { id: 'height', label: 'Height' }],
      formula: 'Area = 0.5 \u00D7 base \u00D7 height',
      area: function (v) { return 0.5 * v.base * v.height; }
    },
    circle: {
      fields: [{ id: 'radius', label: 'Radius' }],
      formula: 'Area = \u03C0 \u00D7 radius \u00D7 radius',
      area: function (v) { return Math.PI * v.radius * v.radius; }
    }
  };

  function clearCalcOutput() {
    calcError.textContent = '';
    calcResult.hidden = true;
    calcFormula.textContent = '';
    calcValue.textContent = '';
  }

  // Build the input fields for the chosen shape
  function renderCalcInputs() {
    var shape = shapes[shapeSelect.value];
    calcInputs.innerHTML = '';

    shape.fields.forEach(function (field) {
      var group = document.createElement('div');
      group.className = 'form-group';

      var label = document.createElement('label');
      label.htmlFor = 'calc-' + field.id;
      label.textContent = field.label;

      var input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.id = 'calc-' + field.id;
      input.name = field.id;
      input.autocomplete = 'off';
      input.placeholder = 'Enter ' + field.label.toLowerCase();

      group.appendChild(label);
      group.appendChild(input);
      calcInputs.appendChild(group);
    });

    clearCalcOutput();
  }

  // Strictly check that a string is a finite number greater than zero
  function parsePositiveNumber(text) {
    var trimmed = text.trim();
    if (trimmed === '') { return { error: 'is required.' }; }
    // Only digits with an optional decimal part are accepted
    if (!/^\d*\.?\d+$|^\d+\.$/.test(trimmed)) { return { error: 'must be a valid number.' }; }
    var number = Number(trimmed);
    if (!Number.isFinite(number)) { return { error: 'must be a finite number.' }; }
    if (number <= 0) { return { error: 'must be greater than zero.' }; }
    return { value: number };
  }

  function handleCalculate(event) {
    event.preventDefault();
    clearCalcOutput();

    var shape = shapes[shapeSelect.value];
    var values = {};
    var firstInvalid = null;

    shape.fields.forEach(function (field) {
      var input = document.getElementById('calc-' + field.id);
      input.classList.remove('input-invalid');
      var parsed = parsePositiveNumber(input.value);

      if (parsed.error) {
        input.classList.add('input-invalid');
        if (!firstInvalid) {
          firstInvalid = input;
          calcError.textContent = field.label + ' ' + parsed.error;
        }
      } else {
        values[field.id] = parsed.value;
      }
    });

    if (firstInvalid) { firstInvalid.focus(); return; }

    var area = shape.area(values);
    if (!Number.isFinite(area)) {
      calcError.textContent = 'The values are too large to calculate. Please use smaller numbers.';
      return;
    }

    // Round to 2 decimal places and drop unnecessary trailing zeros
    var rounded = Math.round(area * 100) / 100;
    calcFormula.textContent = shape.formula;
    calcValue.textContent = 'Area = ' + rounded.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' square units';
    calcResult.hidden = false;
  }

  shapeSelect.addEventListener('change', renderCalcInputs);
  calcForm.addEventListener('submit', handleCalculate);
  calcReset.addEventListener('click', function () {
    shapeSelect.value = 'square';
    renderCalcInputs();
  });
  renderCalcInputs();

  /* ---------------------------------------------------------
     5. CONTACT FORM VALIDATION (frontend only, no sending)
     --------------------------------------------------------- */
  var contactForm = document.getElementById('contactForm');
  var nameInput = document.getElementById('contactName');
  var emailInput = document.getElementById('contactEmail');
  var messageInput = document.getElementById('contactMessage');
  var formFeedback = document.getElementById('formFeedback');

  function showFieldError(input, errorId, message) {
    document.getElementById(errorId).textContent = message;
    input.classList.toggle('input-invalid', message !== '');
    input.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
  }

  function validateName() {
    var value = nameInput.value.trim();
    var message = '';
    if (value === '') { message = 'Please enter your name.'; }
    else if (value.length < 2) { message = 'Name must be at least 2 characters long.'; }
    showFieldError(nameInput, 'nameError', message);
    return message === '';
  }

  function validateEmail() {
    var value = emailInput.value.trim();
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var message = '';
    if (value === '') { message = 'Please enter your email address.'; }
    else if (!emailPattern.test(value)) { message = 'Please enter a valid email address, for example name@example.com.'; }
    showFieldError(emailInput, 'emailError', message);
    return message === '';
  }

  function validateMessage() {
    var value = messageInput.value.trim();
    var message = '';
    if (value === '') { message = 'Please write a message.'; }
    else if (value.length < 10) { message = 'Message must be at least 10 characters long.'; }
    else if (value.length > 1000) { message = 'Message must be 1000 characters or fewer.'; }
    showFieldError(messageInput, 'messageError', message);
    return message === '';
  }

  // Re-check a field as the user types after it has been flagged
  nameInput.addEventListener('input', function () { if (nameInput.classList.contains('input-invalid')) { validateName(); } });
  emailInput.addEventListener('input', function () { if (emailInput.classList.contains('input-invalid')) { validateEmail(); } });
  messageInput.addEventListener('input', function () { if (messageInput.classList.contains('input-invalid')) { validateMessage(); } });

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault(); // stop the page from reloading

    // Run all checks (no short-circuit so every error is shown)
    var nameOk = validateName();
    var emailOk = validateEmail();
    var messageOk = validateMessage();

    formFeedback.className = 'form-feedback';

    if (!nameOk || !emailOk || !messageOk) {
      formFeedback.classList.add('error');
      formFeedback.textContent = 'Please fix the highlighted fields and try again.';
      var firstBad = [nameInput, emailInput, messageInput].find(function (el) {
        return el.classList.contains('input-invalid');
      });
      if (firstBad) { firstBad.focus(); }
      return;
    }

    // Honest feedback: this site has no backend, so nothing is sent
    formFeedback.classList.add('success');
    formFeedback.textContent =
      'Your details look valid, but this message has NOT been sent. ' +
      'This portfolio is frontend-only, so an email service or backend is needed to deliver messages automatically. ' +
      'For now, please email me directly at tusharshinde766613@gmail.com.';
  });

  /* ---------------------------------------------------------
     6. LIVE DEMO BUTTON
     Only works as a real link when the site is hosted online.
     --------------------------------------------------------- */
  var liveDemoButton = document.getElementById('liveDemoButton');
  var liveDemoNote = document.getElementById('liveDemoNote');
  var isHostedOnline =
    (window.location.protocol === 'http:' || window.location.protocol === 'https:') &&
    ['localhost', '127.0.0.1', '[::1]', ''].indexOf(window.location.hostname) === -1;

  if (isHostedOnline) {
    liveDemoButton.href = window.location.href.split('#')[0];
    liveDemoButton.target = '_blank';
    liveDemoButton.rel = 'noopener noreferrer';
    liveDemoNote.textContent = 'You are viewing the live deployed version.';
  } else {
    liveDemoButton.removeAttribute('href');
    liveDemoButton.classList.remove('btn-primary');
    liveDemoButton.classList.add('btn-disabled');
    liveDemoButton.setAttribute('aria-disabled', 'true');
    liveDemoButton.textContent = 'Live Demo (After Deployment)';
    liveDemoNote.textContent = 'Not hosted online yet. This button activates once the site is deployed.';
  }

  /* ---------------------------------------------------------
     7. FOOTER: YEAR AND BACK TO TOP
     --------------------------------------------------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  document.getElementById('backToTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  });
})();
