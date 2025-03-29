/** Base URL for Firebase database connection */
BASE_URL = "https://join-16440-default-rtdb.europe-west1.firebasedatabase.app/";
/** Array to store all contact objects */
let arrayOfContacts = [];
/** Predefined color palette for contact avatars */
const colors = ["rgb(255, 122, 0)", "rgb(147, 39, 255)", "rgb(110, 82, 255)", "rgb(252, 113, 255)", "rgb(255, 187, 43)", "rgb(31, 215, 193)", "rgb(70, 47, 138)", "rgb(255, 70, 70)", "rgb(0, 190, 232)", "rgb(255, 122, 0)"];

/**
 * Initializes the contacts module by loading data from database and rendering contacts
 * @async
 * @returns {Promise<void>}
 */
async function init() {
  await getContactsFromDataBase();
  renderContacts();
}

/**
 * Sets up event handler to trigger contact creation when pressing Enter in input field
 * Provides a keyboard shortcut alternative to clicking the create button
 */
let input = document.querySelector("input");
input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("create_contact_enter").click();
  }
});

/**
 * Adds a new contact to the database
 * @async
 * @returns {Promise<void>}
 */
async function addContactToDataBase() {
  let name = document.getElementById("add_name").value;
  let email = document.getElementById("add_email").value;
  let phone = document.getElementById("add_phone").value;
  if (validateContactInputs(name, email, phone)) return;
  let color = getRandomColor();
  const uniqueKey = `contact_${Date.now()}`;
  try {
    tryHandlingFromAddContact(uniqueKey, { name, email, phone, color });
  } catch (error) {
    console.error("Fehler:", error);
  }
}

/**
 * Handles adding a contact to the database and updates UI
 * @async
 * @param {string} uniqueKey - Unique identifier for the contact
 * @param {Object} contactData - Contact data object
 * @param {string} contactData.name - Contact's name
 * @param {string} contactData.email - Contact's email address
 * @param {string} contactData.phone - Contact's phone number
 * @param {string} contactData.color - Color for contact's avatar
 * @returns {Promise<Object>} The contact data from the server response
 */
async function tryHandlingFromAddContact(uniqueKey, { name, email, phone, color }) {
  let response = await fetch(BASE_URL + `contacts/${uniqueKey}.json`, {
    method: "PUT",
    body: JSON.stringify({ name, email, phone, color }),
  });
  let contactData = await response.json();
  arrayOfContacts.push({ id: uniqueKey, ...contactData });
  renderContacts();
  closeOverlayAddContact();
  deleteInputs();
  setTimeoutSuccessfullyOverlayAddContact();
  setTimeout(() => {
    const newContactIndex = arrayOfContacts.findIndex(contact => contact.id === uniqueKey);
    if (newContactIndex !== -1) {
      toggleOverlayContactInfos(newContactIndex);
    }
  }, 950);
  return contactData;
}

/**
 * Fetches all contacts from the database
 * @async
 * @returns {Promise<Array>} Array of contact objects
 */
async function getContactsFromDataBase() {
  let response = await fetch(BASE_URL + "contacts.json");
  let data = await response.json();
  arrayOfContacts = [];
  try {
    await getContactDatasFromDataBase(data);
    return arrayOfContacts;
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

/**
 * Processes contact data from database and adds to arrayOfContacts
 * @async
 * @param {Object} data - Raw contact data from database
 * @returns {Promise<void>}
 */
async function getContactDatasFromDataBase(data) {
  for (let key in data) {
    let contact = {
      id: key,
      name: data[key].name,
      email: data[key].email,
      phone: data[key].phone,
      color: data[key].color,
    };
    arrayOfContacts.push(contact);
  }
}

/**
 * Gets updated contact data from edit form
 * @param {string} id - Contact ID
 * @returns {Object} Updated contact data object
 */
function getUpdatedContactData(id) {
  return {
    name: document.getElementById("edit_name").value,
    email: document.getElementById("edit_email").value,
    phone: document.getElementById("edit_phone").value,
    color: arrayOfContacts.find((c) => c.id === id).color,
  };
}

/**
 * Sends contact update to the database
 * @async
 * @param {string} id - Contact ID
 * @param {Object} contactData - Updated contact data
 * @returns {Promise<Object>} Server response data
 */
async function sendContactUpdate(id, contactData) {
  const response = await fetch(BASE_URL + `contacts/${id}.json`, {
    method: "PATCH",
    body: JSON.stringify(contactData),
  });
  return await response.json();
}

/**
 * Updates local contact array and refreshes UI
 * @param {string} id - Contact ID
 * @param {Object} contactData - Updated contact data
 * @returns {void}
 */
function updateLocalContactAndUI(id, contactData) {
  const index = arrayOfContacts.findIndex((contact) => contact.id === id);
  arrayOfContacts[index] = { id, ...contactData };
  renderContacts();
  closeOverlayEditContact();
  closeOverlayContactInfoAfterDelete();
}

/**
 * Updates a contact in the database
 * @async
 * @param {string} id - Contact ID
 * @returns {Promise<Object|undefined>} Updated contact data or undefined if error
 */
async function updateContactInDataBase(id) {
  try {
    const updatedContact = getUpdatedContactData(id);
    const contactData = await sendContactUpdate(id, updatedContact);
    updateLocalContactAndUI(id, contactData);
    return contactData;
  } catch (error) {
    console.error("Fehler:", error);
  }
}

/**
 * Deletes a contact from the database and updates UI
 * @async
 * @param {string} id - Contact ID to delete
 * @returns {Promise<void>}
 */
async function deleteContactFromList(id) {
  try {
    const response = await fetch(BASE_URL + `contacts/${id}.json`, {
      method: "DELETE",
    });
    arrayOfContacts = arrayOfContacts.filter((contact) => contact.id !== id);
    await removeContactFromAllTasks(id);
    renderContacts();
    closeOverlayEditContact();
    closeOverlayContactInfoAfterDelete();
  } catch (error) {
    console.error("Error by delete the contact:", error);
  }
}

/**
 * Removes contact from all associated tasks
 * @async
 * @param {string} contactId - Contact ID to remove
 * @returns {Promise<void>}
 */
async function removeContactFromAllTasks(contactId) {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const tasks = await response.json();
    for (const taskId in tasks) {
      const task = tasks[taskId];
      if (task.assigned && task.assigned[contactId]) {
        await fetch(`${BASE_URL}/tasks/${taskId}/assigned/${contactId}.json`, {
          method: "DELETE",
        });
      }
    }
  } catch (error) {
    console.error("Error removing contact from tasks:", error);
  }
}

/**
 * Renders all contacts in the UI, sorted alphabetically
 * @returns {void}
 */
function renderContacts() {
  let contactList = document.getElementById("contact_list");
  contactList.innerHTML = "";
  arrayOfContacts.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
  let renderedLetters = [];
  for (let i = 0; i < arrayOfContacts.length; i++) {
    let contact = arrayOfContacts[i];
    let firstLetter = contact.name.charAt(0).toUpperCase();
    if (renderedLetters.indexOf(firstLetter) === -1) {
      renderLetterTemplate(contactList, renderedLetters, firstLetter);
    }
    renderInitials(contactList, contact, i);
  }
}

/**
 * Renders letter separator in contact list
 * @param {HTMLElement} contactList - Container element for contacts
 * @param {string[]} renderedLetters - Array of letters already rendered
 * @param {string} firstLetter - First letter to render
 * @returns {void}
 */
function renderLetterTemplate(contactList, renderedLetters, firstLetter) {
  contactList.innerHTML += getLetterTemplate(firstLetter);
  renderedLetters.push(firstLetter);
}

/**
 * Renders contact with initials and styling
 * @param {HTMLElement} contactList - Container element for contacts
 * @param {Object} contact - Contact object
 * @param {number} i - Index of contact
 * @returns {void}
 */
function renderInitials(contactList, contact, i) {
  contactList.innerHTML += getContactTemplate(contact, i);
  let initials = getInitials(contact.name);
  let circleElement = document.getElementById(`circle_${i}`);
  circleElement.innerText = initials;
  circleElement.style.backgroundColor = contact.color;
}

/**
 * Clears all input fields
 * @returns {void}
 */
function deleteInputs() {
  let inputs = document.querySelectorAll("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }
}

/**
 * Gets a random color from the colors array
 * @returns {string} A randomly selected color
 */
function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

/**
 * Extracts initials from a name (first letter of each word)
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
  let words = name.split(" ");
  let initialsArray = words.map(function (word) {
    let firstLetter = word.charAt(0).toUpperCase();
    return firstLetter;
  });
  let initials = initialsArray.join("");
  return initials;
}
