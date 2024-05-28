//Describe what each var is used for please
let updateuserListBool = true;
let updateAutomationsListBool = true;
let roleData = [];
let userData;
let AllRoles;
let rolesToBeRemovedFromList = [];
let roleNames = [];
let userCheckboxContainer  = []
let roleCheckboxContainer = []
const breakLine = document.createElement("br")
let itemCount = 0;
const usernames = [];
let itemCountRole = 0;
const roles = [];
const userRoleMap = {};

//Updates role dropdown
async function updateRoleDropdown() {
  const assignUserDropdown = document.getElementById('assignUser');
  const selectedUserIndex = assignUserDropdown.selectedIndex - 1; // Adjust for "--Select a user--"
  const assignRoleDropdown = document.getElementById('discordRolesDropdown');

  if (selectedUserIndex < 0) {
      // If no valid user is selected, clear the dropdown
      assignRoleDropdown.innerHTML = '<option value="">--Select a role--</option>';
      return;
  }

  // Assuming roleData holds the roles for each user and is indexed in sync with the user dropdown
  const userRoles = roleData[selectedUserIndex].map(role => role.id);
  // Assuming AllRoles is an array of all possible roles with properties {roleId, roleName}
  const availableRoles = AllRoles.filter(role => !userRoles.includes(role.roleId));

  // Populate the dropdown with filtered roles
  populateRolesDropdown(availableRoles);
}

//This function is horror, double lambda with a return for each, making readability NIL
async function getUsers(updateUI = true) {
  console.log("FETCHING USER LIST!")
  return fetch('/users')
      .then(response => {
          if (!response.ok) {
              throw new Error('User list not found.');
          }
          return response.json();
      })
      .then(data => {
          if (updateUI) {
              console.log('User list retrieved successfully:', data);
              const userList = document.getElementById('demo');
              userList.innerHTML = ''; // Clear existing list
              data.forEach(user => {
                  const li = document.createElement('li');
                  li.textContent = user.username;
                  li.setAttribute('data-username', user.username);
                  li.innerHTML = `${user.username} - ${user.DISCORD} <button onclick="deleteUser(event, '${user.username}')" 
                    class="delete-btn">✖</button>`;
                  userList.appendChild(li);
              });
          }
          return data; // Return the data for other uses
      })
      .then(data => {
      userData = data;
      console.log('User list retrieved successfully:', data)
      if(updateuserListBool){
          updateUserList();
      }
      i = 0;
      data.forEach(user => {
          roleData[i] = user.roles
          i++;
      });
      return data; // Return the data for other uses
  })
  .catch(error => {
      console.error('Error fetching user list:', error)
      return []; // Return an empty array in case of an error
  })
}

/*This function updates the displayed userlist when new users are added*/
function updateUserList() {
  const userList = document.getElementById('demo');
  const assignUserDropdown = document.getElementById('assignUser');
  userList.innerHTML = ''; // Clear existing list
  assignUserDropdown.innerHTML = '<option value="">--Select a user--</option>'; // Clear existing dropdown options
      userData.forEach(user => {

          // Add user to the list with delete button
          const li = document.createElement('li')
          li.textContent = user.username;
          li.setAttribute('data-username', user.username);
          li.innerHTML = `${user.username} - ${user.DISCORD} <button onclick="deleteUser(event
              , '${user.username}')" class="delete-btn">✖</button>`;
          userList.appendChild(li);

          // Add user to the assign dropdown
          const option = document.createElement('option');
          option.value = user.discord;
          option.textContent = user.DISCORD;
          assignUserDropdown.appendChild(option);
      });
}

/*This function adds users to storage and usage based on user input, it has self contained
Sanitazation and error handling(It will inform the user if entered data is valid for a given field*/
function addUserFromInput() {
  console.log("Adding User: \n")
  const discordInput = document.getElementById('userDiscord').value.trim();
  const username = document.getElementById('usernameInput').value.trim();
  const trelloInput = document.getElementById('userTrello').value.trim();
  const DISCORD = "";

// Check if username contains only letters and underscores
  if (/^[a-zA-Z_]+$/.test(username)) {
      if (!isNaN(discordInput) && discordInput.length >= 17 && discordInput.length <= 18) {
          const user = { discord: discordInput, username: username, trello: trelloInput, DISCORD: DISCORD, roles: []};
          fetch('/addUser', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(user)
          }).then(response => {
              if (!response.ok) {
                  throw new Error('Error adding user.');
              }
              return response.json();
          }).then(data => {
              updateuserListBool = true;
              getUsers();
              updateAssignUserDropdown(DISCORD);
          }).catch(error => 
          console.error('Error adding user:', error));
      } else {
          displayError("Discord ID should be a number between 17 and 18 characters long", document.getElementById('userDiscord'));
      }
  } else {
      displayError("Username should only contain letters and underscores", document.getElementById('usernameInput'));
  }
}

//This function displays error messages for target elements
function displayError(message, targetElement) {
  const errorPopup = document.createElement('div');
  errorPopup.textContent = message;
  errorPopup.className = 'error-popup'; // Add a class for common styles
  // Position the error message relative to the target element
  errorPopup.style.top = (targetElement.offsetTop + targetElement.offsetHeight + 5) + 'px';
  errorPopup.style.left = targetElement.offsetLeft + 'px';
  document.body.appendChild(errorPopup);
  // Remove the error message after 3 seconds
  setTimeout(() => {
      errorPopup.remove();
  }, 3000);
}

function deleteUser(event, username) {
  event.preventDefault();
  // Send a DELETE request to the server to delete the user
  fetch(`/deleteUser/${username}`, {
      method: 'DELETE'
  }).then(response => {
  if (response.ok) {
      // If the user is successfully deleted from the server
      const li = document.querySelector(`li[data-username="${username}"]`);
      if (li) {
          li.remove(); // Remove the user's list item from the DOM
      }
      // Also, remove the user from the dropdown
      const assignUserDropdown = document.getElementById('assignUser');
      for (let i = 0; i < assignUserDropdown.options.length; i++) {
          if (assignUserDropdown.options[i].textContent === username) {
              assignUserDropdown.remove(i);
              break;
          }
      }
      } else {
          console.error('Failed to delete user:', response.statusText);
      }
  })
  .catch(error => console.error('Error deleting user:', error));
}

async function assignAndRemoveRole() {
    const assignUserDropdown = document.getElementById('assignUser');
    const assignRoleDropdown = document.getElementById('discordRolesDropdown');
    const selectedUserIndex = assignUserDropdown.selectedIndex - 1; // Adjusting for the default "--Select a user--" option
    const selectedRoleIndex = assignRoleDropdown.selectedIndex - 1;
    const selectedUser = assignUserDropdown.value;
    const selectedRole = assignRoleDropdown.value;
    const selectedRoleId = assignRoleDropdown.options[assignRoleDropdown.selectedIndex].value;  
    const selectedUserName = assignUserDropdown.options[selectedUserIndex+1].textContent;
    const selectedRoleName = assignRoleDropdown.options[selectedRoleIndex+1].textContent;
    //Handles if a user has not selected one of the two selections
    if (selectedUserIndex < 0 || !selectedRole) {
        alert('Please select both a user and a role.');
        return;
    //If valid entires have been selected, display success message
    } else {
        displaySuccessPop(`${selectedUserName} has been assigned ${selectedRoleName}`)
    }
    //Attmpet to assign user to role
    try {
        const response = await fetch('/assignUserRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedUser, selectedRole })
        });
        //Simple error handling
        if (!response.ok) {
            throw new Error('Failed to assign role.');
        }
        //If assigning the role does not fail, push the user to roleData
        roleData[selectedUserIndex].push({
            id: selectedRoleId, name: assignRoleDropdown.options[assignRoleDropdown.selectedIndex].text 
        });
        // Remove the assigned role from the dropdown so it cannot be double assigned
        assignRoleDropdown.remove(assignRoleDropdown.selectedIndex);
        assignRoleDropdown.selectedIndex = 0;
        updateRoleDropdown();  // Call this to refresh and filter out assigned roles
    } catch (error) {
        console.error('Error during role assignment:', error);
        alert('Error occurred while assigning role.');
    }
}

//Ensure updateRoleDropdown uses roleData to filter roles
function populateRolesDropdown(roles) {
  // console.log(roles)
  const dropdown = document.getElementById('discordRolesDropdown');
  dropdown.innerHTML = '<option value="">--Select a role--</option>'; // Clear previous entries
  roles.forEach(role => {
      const option = document.createElement('option');
      option.value = role.roleId;
      option.textContent = role.roleName;
      dropdown.appendChild(option);
  });
}

function updateAssignUserDropdown(DISCORD) {
  const assignUserDropdown = document.getElementById('assignUser');
  const option = document.createElement('option');
  option.text = DISCORD;
  option.value = DISCORD;
  assignUserDropdown.add(option);
}

function updateAssignRoleDropdown(role) {
  const assignRoleDropdown = document.getElementById('assignRole');
  const option = new Option(role, role);
  assignRoleDropdown.add(option);
}

// Fetch roles from the server and populate the dropdown menu
function fetchDiscordRoles() {
  fetch('/discordRoles') 
  .then(response => {
      if (response.ok) {
          return response.json();
      } else {
          throw new Error('Failed to fetch Discord roles.');
      }
  }).then(data => {
      // console.log('Discord roles:', data);
      AllRoles = data;
  }).catch(error => {
      console.error('Error fetching Discord roles:', error);
  });
}

//Creates a custom role from webpage input
async function createRole() {
  const roleTitleInput = document.getElementById('roleInput');
  const roleTitle = roleTitleInput.value.trim();
  if (!roleTitle) {
      alert('Please enter a role title');
      return;
  } else {
      displaySuccessPop(`${roleTitle} added successfully!`);
  }
  try {
      const response = await fetch('/DiscordAPI', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleTitle })
      });
      if (response.ok) {
          fetchDiscordRoles();
          roleTitleInput.value = ''; // Clear the role text field after success
      } else {
          throw new Error('Failed to add role.');
      } 
  } catch (error) {
      console.error('Error adding role:', error);
      alert('An error occurred while adding the role');
  }
}

//Displays a simple success message when succesfully added role
function displaySuccessPop(message) {
const successPopup = document.getElementById('successPopup');   // Get the success pop-up element
successPopup.textContent = message; // Set the message content
successPopup.classList.add('show');  // Add the 'show' class to display the pop-up
setTimeout(() => {
  successPopup.classList.remove('show');
}, 3000); 
}

//This function checks if a board is stored
//  If there is a stored board it verifies that these match, and if they dont
//  It makes it so that the stored board matches the live board and
// Delivers it to the place it was called
async function checkExistingAutomations(boardTitle) {
  let data = []
  try {
      const response = await fetch(`/config/automationList.json`);
      if (!response.ok) {throw new Error('No existing automations found')}
      data = await response.json();
  } catch (error) {
      console.error('Error fetching existing automations:', error);
      return null;
  }
  try {
      const response2 = await fetch('/trello', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ boardTitle })
  });
  if (response2.ok) {
      const liveBoard = await response2.json();
      console.log("Data received: response2");
      let liveCards = 0
      let storedCards = 0
      if (liveBoard && liveBoard.cards) {

        //Below checks if all there are any missing stored cards:
        for (liveCards; liveCards < liveBoard.cards.length; liveCards++) {
            let cardsForDeletion = []
            let updateNewCardBool = true
            let storedCards = 0
            console.log("Looking at live card nr.: " + liveBoard.cards[liveCards].id)
            for (storedCards; storedCards < data.length; storedCards++) { 
                console.log("Looking at stored card nr.: " + data[storedCards].id)
                if (liveBoard.cards[liveCards].id === data[storedCards].id) {
                    console.log("ID: " + data[storedCards].id + " is on the list");
                    updateNewCardBool = false
                    break
                }
            }
            if (updateNewCardBool === true) { // Check if updateNewCardBool is true for this card (i.e., card is missing)
                console.log("ID: " + liveBoard.cards[liveCards].id + "\nNAME: " + liveBoard.cards[liveCards].name + "\nis NOT on the list");
                let cardData = {
                    id: liveBoard.cards[liveCards].id,
                    trello: false,
                    github: false,
                    name: liveBoard.cards[liveCards].name,
                    automationType: 'None',
                    selectedUsers: [],
                    selectedRoles: [],
                    dueDate: []
                };
                if(cardData != undefined){
                    // console.log("!---Updating Board---!")
                    // console.log(cardData)
                    updateAutomationList(cardData)
                    data.push(cardData)
                }
            }
            //check if any cards are stored which are not present in live. Delete
            // if so, this is done sepratly from the other checks for easy reading
            data = data.filter(card => {
                console.log(`Checking if card needs to be deleted:\n${card}`);
                const index = liveBoard.cards.findIndex(item => item.id === card.id);
                if (index === -1) {
                    console.log("--Card needs to be deleted--");
                    return false; // Exclude this card from the new array
                } else {
                    console.log("--Card does not need to be deleted--");
                    return true; // Include this card in the new array
                }
            })
        }
    }
}
  } catch (error) {
      console.error('Error fetching board details:', error);
      alert('An error occurred while fetching board details');
  }
  console.log("!---Return data---!")
  console.log(data)
  return data;
}

//Should display a boards items:
async function getBoardInfo() {
  event.preventDefault();
  const boardTitle = document.getElementById('boardTitleInput').value.trim();
  if (!boardTitle) {
      alert('Please enter a board title');
      return;
  }
  //Attempts to fetch stored data
  try {
      const response = await fetch('/trello', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ boardTitle })
      });
      //Stores recived data locally if any was found
      if (response.ok) {
          const details = await response.json();
          // console.log("Data received:", details);
          if (details && details.cards) {
              // console.log(details.cards)
              //Uses the display card list function, this checks for existing data and builds from scratch 
              //Or from storage
              displayCardList(details.cards,boardTitle, userData, AllRoles);
          } else {
              alert('Board not found or error fetching details');
          }
      } else {
          throw new Error('Failed to fetch board details');
      }
  } catch (error) {
      console.error('Error fetching board details:', error);
      alert('An error occurred while fetching board details');
  }
}
/*This function takes a list of cards gotten from the board in getBoardInfo
Afterwards it builds each card with all the required data
  It takes a board title to check for existing boards
  It uses the user and role lists to populate the checkbox menus for selection
  Cards is simply all the items needed to be constructed
*/
async function displayCardList(cards, boardTitle, userList, rolesList) {
  const cardList = document.getElementById('cardList');
  cardList.innerHTML = ''; // Clear existing list
  const mainDiv = document.createElement('div');
  mainDiv.classList.add('card-list');
  // Check config folder for existing automations
  const existingAutomations = await checkExistingAutomations(boardTitle);
  if (existingAutomations && Object.keys(existingAutomations).length > 0) {
      console.log('Using existing automations to construct card list');
      cards = existingAutomations; // Use the existing data if available
      updateAutomationsListBool = false;
  } else {
      console.log('No existing automations found, building from scratch');
  }
  
  cards.forEach(card => {
      const li = document.createElement('li');
      const textNode = document.createTextNode(card.name + " - Select A Type Of Automation: ");
      li.appendChild(textNode);

      // Create a container for radio buttons
      const radioContainer = document.createElement('div');

      // Option 1: Trello
      const trelloRadio = createRadio('radio_trello', card.id, 'Trello');
      radioContainer.appendChild(trelloRadio.radio);
      radioContainer.appendChild(trelloRadio.label);

      // Option 2: GitHub
      const githubRadio = createRadio('radio_github', card.id, 'GitHub');
      radioContainer.appendChild(githubRadio.radio);
      radioContainer.appendChild(githubRadio.label);

      li.appendChild(radioContainer);

      // Create a container for additional inputs
      const additionalInput = document.createElement('div');
      additionalInput.id = `additional_${card.id}`;
      additionalInput.style.display = 'block'; // Initially visible
      li.appendChild(additionalInput);

      // Create a container for users checkboxes
      const userCheckboxContainer = document.createElement('div');
      userCheckboxContainer.id = `userCheckboxes_${card.id}`;
      userCheckboxContainer.classList.add('checkbox-container');
      li.appendChild(userCheckboxContainer);

      // Create a container for roles checkboxes
      const roleCheckboxContainer = document.createElement('div');
      roleCheckboxContainer.id = `roleCheckboxes_${card.id}`;
      roleCheckboxContainer.classList.add('checkbox-container');
      li.appendChild(roleCheckboxContainer);

      // Display all users checkboxes
      console.log("displaying users")
      userData.forEach(user => {
          const userCheckbox = createUserCheckbox(user, `userCheckbox_${user.discord}_${card.id}`);
          userCheckboxContainer.appendChild(userCheckbox);
      });

      // Display all roles checkboxes
      console.log("displaying roles")
      AllRoles.forEach(role => {
          const roleCheckbox = createRoleCheckbox(role, `roleCheckbox_${role.roleId}_${card.id}`);
          roleCheckboxContainer.appendChild(roleCheckbox);
      });

      mainDiv.appendChild(li);
      // Add "Update Card" button
      
      const updateButton = document.createElement('input');
      updateButton.type = "button"
      updateButton.value = 'Update Card';
      updateButton.onclick = function(){handleUpdateCard(card, userCheckboxContainer, roleCheckboxContainer)}
      li.appendChild(updateButton)

      // Add existing data to the additional input div if available
      let existingIndex = existingAutomations.findIndex(data => data.id === card.id);
      if (existingIndex !== -1) {
          let existingData = existingAutomations[existingIndex];
          if (existingData.automationType === 'Trello') {
              trelloRadio.radio.checked = true;
              additionalInput.style.display = 'block'; // Initially visible
          } else if (existingData.automationType === 'GitHub') {
              githubRadio.radio.checked = true;
              additionalInput.style.display = 'block'; // Initially visible
          }
          //Ensures that all data is loaded before trying to find it, base at 500 ms
          setTimeout(()=> {

          existingData.selectedUsers.forEach(selectedUser => {
              console.log(`Checking user checkbox: userCheckbox_${selectedUser.discord}_${card.id}`);
              let userCheckbox = document.getElementById(`userCheckbox_${selectedUser.discord}_${card.id}`);
              userCheckbox.checked = true;
          });
          existingData.selectedRoles.forEach(selectedRole => {
              console.log(`Checking role checkbox: roleCheckbox_${selectedRole.roleId}_${card.id}`);
              const roleCheckbox = document.getElementById(`roleCheckbox_${selectedRole.roleId}_${card.id}`);
              console.log(roleCheckbox)
              if (roleCheckbox) {
                  console.log("Role checkbox already checked")
                  roleCheckbox.checked = true;
              } else {
                  console.log(`Role checkbox not found for role ID: ${selectedRole.roleId}_${card.id}`);
              }
          });
      }, 500);    
      }
      cardList.appendChild(mainDiv);
  });
}

//Takes given data and readies it for the updateAutomations function together with handleOption
function handleUpdateCard(card, userCheckboxContainer, roleCheckboxContainer) {
    // console.log("test123")
    // console.log(card)
  const selectedValue = document.querySelector(`input[name="radio_${card.id}"]:checked`).value;
  const selectedUsers = Array.from(userCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked'));
  const selectedRoles = Array.from(roleCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked'));
  handleOption(card, selectedValue, selectedUsers, selectedRoles);
  // console.log('Card updated:', card);
  // Now you can choose to send the updated card data to the server when needed
  updateAutomationList(card);
}

//Creates radios for automation selection
function createRadio(name, cardId, labelText) {
  const radioContainer = document.createElement('div');
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = `radio_${cardId}`; // Assigning the same name for all radio buttons of the same card
  radio.value = labelText;
  radio.id = `radio_${name}_${cardId}`;
  const label = document.createElement('label');
  label.htmlFor = `radio_${name}_${cardId}`;
  label.textContent = labelText;
  radioContainer.appendChild(radio);
  radioContainer.appendChild(label);
  return { radio, label };
}

function createUserCheckbox(user, checkboxId) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = checkboxId;
  checkbox.value = user.discord;
  checkbox.checked = false

  const label = document.createElement('label');
  label.htmlFor = checkboxId;
  label.appendChild(document.createTextNode(user.username));

  const div = document.createElement('div');
  div.appendChild(checkbox);
  div.appendChild(label);

  return div;
}

function createRoleCheckbox(role, checkboxId) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = checkboxId;
  checkbox.value = role.roleId;
  checkbox.checked = false

  const label = document.createElement('label');
  label.htmlFor = checkboxId;
  label.appendChild(document.createTextNode(role.roleName));

  const div = document.createElement('div');
  div.appendChild(checkbox);
  div.appendChild(label);

  return div;
}
//Handling TODO LIST:
/*
OVERALL: BRUG CRUD DIN NØD!

1) FLYT TINGENE SERVERSIDE, DET VILLE GØRE MANGE TING REDUNDANT! -- Det er flyttet til webpage managment
2) LAV INDIVIDUELLE FUNCTIONS TIL HVERT FELT -- ikke noedvendigt nu med nye changes?
  Altså alle kontroller er handlet af en manager, det giver mange problemer
  hvis man selecter en rolle, append det, hvis man remover en rolle, find det array og tøm det
  Lav dropdownen til en checkliste i stedet for en selected, altså et flueben til en bruger eller rolle

3) Det er meget lettere at holde styr på alle de her ting hvis man bare sender det hele over til serveren, lad den
  behandle alt data og logik, og så lad den sende dumme html bidder til clientside
  (den skal stadig have rolle, user og card, names og ids) -- ikke helt saadan det er blevet implementeret
4) DEFINER CARD CLASSEN INDEN VI BEGYNDER AT BRUGE DEN OVER DET HELE
  spare en masse cardData tingenoter -- ikke done lol
*/

/*This function constructs new cards and overwrites previous data on update
As it always takes all the required data, no issues with overwrting
existing data should occur<--Dangerous statement*/
function handleOption(card, automationType, selectedUsers, selectedRoles) {
  //This crudely ensures that only checked users and roles are sent
  card.selectedRoles = []
  card.selectedUsers = []
  //Set basic info
  card.automationType = automationType;
  card.trello = (automationType === 'Trello');
  card.github = (automationType === 'GitHub');
  
  
  //Append selected users
  selectedUsers.forEach(userCheckbox => {
      const user = userCheckbox.parentNode.querySelector('label').textContent;
      const discord = userCheckbox.value;
      // Check if the user is already in the selectedUsers array
      if (!card.selectedUsers.some(u => u.discord === discord)) {
          card.selectedUsers.push({ username: user, discord: discord });
      }
  });

  //Append selected roles
  selectedRoles.forEach(roleCheckbox => {
      const role = roleCheckbox.parentNode.querySelector('label').textContent;
      const roleId = roleCheckbox.value;
      // Check if the role is already in the selectedRoles array
      if (!card.selectedRoles.some(role => role.roleId === roleId)) {
          card.selectedRoles.push({ roleId: roleId, roleName: role });
      }
  });
}

//This function takes an updated card structure and sends it to the server endpoint
function updateAutomationList(automationData) {
  // console.log(automationData)
  fetch('/updateAutomationList', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(automationData)
  })
  .then(response => response.json())
  .then(data => {
      console.log('Success:', data);
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}    
