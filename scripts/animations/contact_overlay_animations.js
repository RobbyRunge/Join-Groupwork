/**
 * Stores the ID of the contact that is currently being edited
 * Used to track which contact needs to be displayed after editing is complete
 * Set when opening the edit overlay and referenced when closing to show updated info
 *
 * @type {string|null} - Contact ID string or null if no contact is being edited
 */
let lastEditedContactId;

/**
 * Closes the contact information overlay after deleting a contact
 * Animates the overlay sliding out to the right and hides it
 */
function closeOverlayContactInfoAfterDelete() {
  let overlay = document.getElementById("overlay_contact_infos");
  overlay.style.animation = "slideOutToRight 125ms forwards";
  overlay.addEventListener(
    "animationend",
    () => {
      overlay.classList.add("d_none");
      overlay.style.animation = "";
    },
    { once: true }
  );
}

/**
 * Opens the overlay for adding a new contact
 * Shows the background overlay and animates the contact card sliding in from the right
 */
function openOverlayAddContact() {
  let overlayRef = document.getElementById("overlay_add_contacts_background");
  let overlayCardRef = document.getElementById("overlay_add_contact_card");
  overlayRef.classList.add("overlay_background");
  overlayCardRef.classList.add("overlay_add_contact_card");
  overlayCardRef.style.animation = "slideInFromRight 125ms forwards";
}

/**
 * Opens the overlay for editing an existing contact
 * Stores the contact ID for later use after editing is complete
 * Populates the edit form with the selected contact's information
 *
 * @param {string} contactId - The unique identifier of the contact to edit
 */
function openOverlayEditContact(contactId) {
  lastEditedContactId = contactId;
  let contact = arrayOfContacts.find((c) => c.id === contactId);
  let overlayRef = document.getElementById("overlay_add_contacts_background");
  let overlayEditCardRef = document.getElementById("overlay_edit_contact_card");
  overlayEditCardRef.innerHTML = getTemplateOfContactEdit(contact);
  overlayRef.classList.add("overlay_background");
  overlayEditCardRef.classList.add("overlay_edit_contact_card");
  overlayEditCardRef.style.animation = "slideInFromRight 125ms forwards";
}

/**
 * Closes the add contact overlay
 * Animates the card sliding out to the right and removes overlay classes
 * Clears input fields after animation completes
 */
function closeOverlayAddContact() {
  let overlayRef = document.getElementById("overlay_add_contacts_background");
  let overlayCardRef = document.getElementById("overlay_add_contact_card");
  overlayRef.style.backgroundColor = "transparent";
  overlayCardRef.style.animation = "slideOutToRight 125ms forwards";
  overlayCardRef.addEventListener(
    "animationend",
    () => {
      overlayRef.classList.remove("overlay_background");
      overlayCardRef.classList.remove("overlay_add_contact_card");
      overlayCardRef.style.animation = "";
      overlayRef.style.backgroundColor = "";
      deleteInputs();
    },
    { once: true }
  );
}

/**
 * Displays a success message when a contact is created
 * Shows the message with a slide-in animation and automatically hides it after a delay
 */
function overlayContactSuccessfullyCreated() {
  let overlayRef = document.getElementById("contact_successfully_created");
  overlayRef.classList.remove("d_none");
  overlayRef.classList.add("overlay_contact_successfully_created");
  overlayRef.style.animation = "slideInFromRight 125ms forwards";
  setTimeout(() => {
    overlayRef.style.animation = "slideOutToRight 125ms forwards";
  }, 800);
}

/**
 * Displays a success message when a contact is edited
 * Shows the message with a slide-in animation and automatically hides it after a delay
 */
function overlayContactSuccessfullyEdited() {
  let overlayRef = document.getElementById("contact_successfully_edit");
  overlayRef.classList.remove("d_none");
  overlayRef.classList.add("overlay_contact_successfully_created");
  overlayRef.style.animation = "slideInFromRight 125ms forwards";
  setTimeout(() => {
    overlayRef.style.animation = "slideOutToRight 125ms forwards";
  }, 800);
}

/**
 * Displays a success message when a contact is deleted
 * Shows the message with a slide-in animation and automatically hides it after a delay
 */
function overlayContactSuccessfullyDelete() {
  let overlayRef = document.getElementById("contact_successfully_deleted");
  overlayRef.classList.remove("d_none");
  overlayRef.classList.add("overlay_contact_successfully_created");
  overlayRef.style.animation = "slideInFromRight 125ms forwards";
  setTimeout(() => {
    overlayRef.style.animation = "slideOutToRight 125ms forwards";
  }, 800);
}

/**
 * Sets a short delay before showing the contact created success message
 */
function setTimeoutSuccessfullyOverlayAddContact() {
  setTimeout(() => {
    overlayContactSuccessfullyCreated();
  }, 200);
}

/**
 * Sets a short delay before showing the contact edited success message
 */
function setTimeoutSuccessfullyOverlayEdit() {
  setTimeout(() => {
    overlayContactSuccessfullyEdited();
  }, 200);
}

/**
 * Sets a short delay before showing the contact deleted success message
 */
function setTimeoutDeleteOverlayContact() {
  setTimeout(() => {
    overlayContactSuccessfullyDelete();
  }, 200);
}

/**
 * Closes the edit contact overlay with animation
 * After closing, shows success message and then automatically opens
 * the contact info overlay displaying the updated contact information
 * Uses the stored contactId (lastEditedContactId) to determine which contact to show
 */
function closeOverlayEditContact() {
  let overlayRef = document.getElementById("overlay_add_contacts_background");
  let overlayCardRef = document.getElementById("overlay_edit_contact_card");
  overlayRef.style.backgroundColor = "transparent";
  overlayCardRef.style.animation = "slideOutToRight 125ms forwards";
  overlayCardRef.addEventListener(
    "animationend",
    () => {
      overlayRef.classList.remove("overlay_background");
      overlayCardRef.classList.remove("overlay_edit_contact_card");
      overlayCardRef.style.animation = "";
      overlayRef.style.backgroundColor = "";
      clearErrorMessages();
      setTimeout(() => {
        openContactInfoAfterEdit(lastEditedContactId);
      }, 800);
    },
    { once: true }
  );
}

/**
 * Opens the contact info overlay for a specific contact after editing
 * Finds the updated contact in the contacts array, highlights it in the list,
 * and displays its information in the overlay with a slide-in animation
 *
 * @param {string} contactId - The unique identifier of the contact to display
 * @returns {void} - Returns early if no contactId is provided
 */
function openContactInfoAfterEdit(contactId) {
  if (!contactId) return;
  const contactIndex = arrayOfContacts.findIndex((contact) => contact.id === contactId);
  if (contactIndex !== -1) {
    const contactElement = document.getElementById(`contact_${contactIndex}`);
    if (contactElement) {
      removeActiveClassFromContacts();
      let contact = arrayOfContacts[contactIndex];
      let overlay = document.getElementById("overlay_contact_infos");
      contactElement.classList.add("contact_active");
      contactElement.classList.remove("hover_contact_list");
      overlay.innerHTML = getTemplateOfContactInfo(contact);
      overlay.classList.remove("d_none");
      overlay.style.animation = "slideInFromRight 125ms forwards";
    }
  }
}

/**
 * Toggles the contact information overlay for a specific contact
 * If the contact is already active, it closes the overlay
 * If the contact is not active, it shows the overlay with contact details
 *
 * @param {number} index - The index of the contact in the contacts array
 */
function toggleOverlayContactInfos(index) {
  let overlay = document.getElementById("overlay_contact_infos");
  let contactElement = document.getElementById(`contact_${index}`);
  let contact = arrayOfContacts[index];
  if (contactElement.classList.contains("contact_active")) {
    ifContactElementContainsContactActive(overlay, contactElement);
  } else {
    removeActiveClassFromContacts();
    elseContactElementContainsContactActive(overlay, contactElement, contact);
  }
}

/**
 * Closes the contact information overlay
 * Animates the overlay sliding out to the right and removes active states from contacts
 */
function closeContactInfoOverlay() {
  let overlay = document.getElementById("overlay_contact_infos");
  overlay.style.animation = "slideOutToRight 125ms forwards";
  overlay.addEventListener(
    "animationend",
    () => {
      overlay.classList.add("d_none");
      overlay.style.animation = "";
      removeActiveClassFromContacts();
    },
    { once: true }
  );
}

/**
 * Removes the active class from all contacts in the list
 * Restores hover effect on all contacts
 */
function removeActiveClassFromContacts() {
  const activeContacts = document.querySelectorAll(".contact_active");
  for (let i = 0; i < activeContacts.length; i++) {
    activeContacts[i].classList.remove("contact_active");
    activeContacts[i].classList.add("hover_contact_list");
  }
}

/**
 * Handles the case when a contact element already has the active class
 * Removes active styling and closes the overlay with animation
 *
 * @param {HTMLElement} overlay - The contact info overlay element
 * @param {HTMLElement} contactElement - The contact element in the list
 */
function ifContactElementContainsContactActive(overlay, contactElement) {
  contactElement.classList.remove("contact_active");
  contactElement.classList.add("hover_contact_list");
  overlay.style.animation = "slideOutToRight 125ms forwards";
  overlay.addEventListener(
    "animationend",
    () => {
      overlay.classList.add("d_none");
      overlay.style.animation = "";
    },
    { once: true }
  );
}

/**
 * Handles the case when a contact element doesn't have the active class
 * Adds active styling to the contact and displays its information in the overlay
 *
 * @param {HTMLElement} overlay - The contact info overlay element
 * @param {HTMLElement} contactElement - The contact element in the list
 * @param {Object} contact - The contact data object to display
 */
function elseContactElementContainsContactActive(overlay, contactElement, contact) {
  contactElement.classList.add("contact_active");
  contactElement.classList.remove("hover_contact_list");
  if (overlay.classList.contains("d_none")) {
    overlay.innerHTML = getTemplateOfContactInfo(contact);
    overlay.classList.remove("d_none");
    overlay.style.animation = "slideInFromRight 125ms forwards";
  } else {
    elseOverlayContactInfosGoOut(overlay, contact);
  }
}

/**
 * Handles animation for changing contact information in an already open overlay
 * Slides out the current overlay, updates content, then slides it back in
 *
 * @param {HTMLElement} overlay - The contact info overlay element
 * @param {Object} contact - The new contact data object to display
 */
function elseOverlayContactInfosGoOut(overlay, contact) {
  overlay.style.animation = "slideOutToRight 125ms forwards";
  overlay.addEventListener(
    "animationend",
    () => {
      overlay.classList.add("d_none");
      overlay.style.animation = "";
      setTimeout(() => {
        overlay.innerHTML = getTemplateOfContactInfo(contact);
        setTimeout(() => {
          overlay.classList.remove("d_none");
          overlay.style.animation = "slideInFromRight 125ms forwards";
        }, 50);
      }, 50);
    },
    { once: true }
  );
}

/**
 * Adds an event listener to the document to close the overlay when clicking outside
 * Checks if the clicked element is the overlay background or the overlay card
 * If true, closes the overlay by removing the overlay classes
 * If false, keeps the overlay open
 * @param {Event} event - The event object from the clicked element
 * @param {HTMLElement} overlayBg - The overlay background element
 * @param {HTMLElement} overlayCard - The overlay card element
 * @param {HTMLElement} overlayEditCard - The overlay edit card element
 * @listens click
 * @returns {void}
 */
addEventListener("click", (event) => {
  const overlayBg = document.getElementById("overlay_add_contacts_background");
  const overlayCard = document.getElementById("overlay_add_contact_card");
  const overlayEditCard = document.getElementById("overlay_edit_contact_card");
  if (event.target === overlayBg) {
    if (overlayCard.classList.contains("overlay_add_contact_card")) {
      closeOverlayAddContact();
    } else if (overlayEditCard.classList.contains("overlay_edit_contact_card")) {
      closeOverlayEditContact();
    }
  }
});
