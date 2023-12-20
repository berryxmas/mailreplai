/* global document, Office */
import { franc } from 'franc-min';

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";

    var generateReplyButton = document.getElementById('generate-reply');
    if (generateReplyButton) {
      generateReplyButton.onclick = function() { generateReply(); }; // Call without event object
    }

    var generateReplyTestButton = document.getElementById('generate-reply-test');
    if (generateReplyTestButton) {
        generateReplyTestButton.onclick = generateStandardEmail;
    }

    document.getElementById('use-reply').addEventListener('click', function() {
      var replyContent = document.getElementById('gpt-reply').innerHTML;
      Office.context.mailbox.item.displayReplyAllForm({ 'htmlBody': replyContent });
    });

    document.getElementById('adjust-reply').addEventListener('click', function() {
      // Display the input field and the submit button when the "Adjust Reply" button is clicked
      document.getElementById('adjust-input-container').style.display = 'flex';
    });

    // Event handler for 'submit-adjustment' button
    document.getElementById('submit-adjustment').addEventListener('click', function() {
      // Correctly extract the adjustment string from the input field
      var adjustment = document.getElementById('adjust-input').value.trim();

      // Check if adjustment is not empty, then call generateReply with adjustment
      if (adjustment) {
        generateReply(adjustment);
      }
    });

    // Get a reference to the current message
    const item = Office.context.mailbox.item;

    // Get the elements
    let titleElement = document.getElementById("item-subject");
    let senderElement = document.getElementById("email-sender");

    // Update the elements
    titleElement.innerHTML += item.subject;
    senderElement.innerHTML += item.from.emailAddress;
  }
});

// Global variable to store the last generated reply
let lastGeneratedReply = '';


// For testing purposes we use a standard email
export async function generateStandardEmail() {
  // Define the standard email
  var standardEmail = "Dear Customer,\n\nThank you for your email. We will get back to you as soon as possible.\n\nBest regards,\nCustomer Service";

  // Display status message
  document.getElementById('status-message').textContent = 'Generating for you...';

  // Display the standard email in the appropriate element
  document.getElementById('gpt-reply').innerHTML = standardEmail;

  document.getElementById('status-message').textContent = 'Reply generated!';

  // Show the "Use Reply" and "Adjust Reply" buttons
  document.getElementById('button-container').style.display = 'flex';
}

export async function generateReply(adjustment) {
  console.log('Generate Reply button pressed. Reply is on its way...');

  Office.context.mailbox.item.body.getAsync("text", { asyncContext: "This is passed to the callback" }, async function(result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = result.value; // This is the email content
      // Only pass the adjustment if it's a string
      if (typeof adjustment === 'string' && adjustment.trim() !== '') {
        generateEmailReply(emailBody, adjustment);
      } else {
        generateEmailReply(emailBody);
      }
    }
  });
}

async function generateEmailReply(emailBody, adjustment) {
  // Display status message
  document.getElementById('status-message').textContent = 'Generating for you...';

  // Detect the language of the email
  const language = franc(emailBody);

  if (adjustment) {
    // If an adjustment is made, change the prompt accordingly
    prompt = `Make this adjustment: ${adjustment}. To the following email: ${lastGeneratedReply}. Remember the original email: ${emailBody}. And be sure to answer in ${language}.`;
  } else {
    // If no adjustment is provided, use the original prompt
    prompt = `Please reply to this email in ${language}. The email is as follows: \n${emailBody}\n`;
  }

  // Define the request body
  let requestBody = { content: prompt, language: language };

  // Call the FastAPI application
  fetch('https://mailreplai.vercel.app/generate-reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => response.json())
  .then(data => {
    // Use the generated reply
    console.log(data);
    document.getElementById('gpt-reply').innerHTML = data.replace(/\n/g, '<br>');
    // Send status message
    document.getElementById('status-message').textContent = 'Reply generated!';
    // Save data as lastgeneratedreply
    lastGeneratedReply = data;
    // Show the "Use Reply" button
    document.getElementById('button-container').style.display = 'flex';
  })
  .catch(error => {
    // Log any errors that occur during the fetch request
    console.error('Error:', error);
  });
}

document.getElementById('submit-adjustment').addEventListener('click', function() {
  // Get the adjustment from the input field
  var adjustment = document.getElementById('adjust-input').value;

  // Call the function to generate the reply with the email body and the adjustment
  Office.context.mailbox.item.body.getAsync("text", { asyncContext: "This is passed to the callback" }, async function(result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = result.value; // This is the email content
      generateEmailReply(emailBody, adjustment);
    }
  });
});
