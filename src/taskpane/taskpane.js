/* global document, Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";

    var generateReplyButton = document.getElementById('generate-reply');
    if (generateReplyButton) {
        generateReplyButton.onclick = generateReply;
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

    document.getElementById('submit-adjustment').addEventListener('click', function() {
      // Get the adjustment from the input field
      var adjustment = document.getElementById('adjust-input').value;

      // Call the generateReply function with the adjustment
      generateReply(adjustment);
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

  // Read content from the current message
  Office.context.mailbox.item.body.getAsync("text", { asyncContext: "This is passed to the callback" }, async function(result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = result.value; // This is the email content

      // Display status message
      document.getElementById('status-message').textContent = 'Generating for you...';

      // Show loading icon
      document.getElementById('loadingIcon').style.display = 'block';

      // Define prompt for GPT-3
      const prompt = `Please reply to this email. Use the language from the emailbody: \n${emailBody}\n`;

      // Define the request body
      let requestBody = {content: prompt};

      // If an adjustment is provided, include it in the request body
      if (adjustment) {
        requestBody.adjustment = adjustment;
      }

      // Create a promise for the fetch request
      const fetchPromise = fetch('https://mailreplai-api-container.orangesand-d38ef50e.westeurope.azurecontainerapps.io/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Create a timeout promise
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject('The AI is too busy, try later. In the meantime please consider providing us feedback');
        }, 30000); // 30 seconds
      });

      // Race the fetch promise against the timeout promise
      Promise.race([fetchPromise, timeoutPromise])
        .then(async response => {
          if (response instanceof Response) {
            const data = await response.json();
            // Use the generated reply
            console.log(data);
            document.getElementById('gpt-reply').innerHTML = data.replace(/\n/g, '<br>');
            // Display success status message
            document.getElementById('status-message').textContent = 'Reply generated!';
            // Show the "Use Reply" button
            document.getElementById('button-container').style.display = 'flex';
          } else {
            throw new Error('Fetch took too long');
          }
        })
        .catch(error => {
          // Handle fetch errors or timeout
          console.error('Error:', error);
          document.getElementById('status-message').textContent = error;
        })
        .finally(() => {
          // Hide loading icon
          document.getElementById('loadingIcon').style.display = 'none';
        });
    }
  });
}
