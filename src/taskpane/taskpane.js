/* global document, Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById('generate-reply').onclick = generateReply;
  //   document.getElementById('use-reply').addEventListener('click', function() {
  //     var replyContent = document.getElementById('gpt-reply').innerHTML;
  //     Office.context.mailbox.item.displayReplyForm({ 'htmlBody': replyContent });
  // });
    document.getElementById('use-reply').addEventListener('click', function() {
      var replyContent = document.getElementById('gpt-reply').innerHTML;
      Office.context.mailbox.item.displayReplyAllForm({ 'htmlBody': replyContent });
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

export async function generateReply() {
  console.log('Generate Reply button pressed. Reply is on its way...');

  // Read content from the current message
  Office.context.mailbox.item.body.getAsync("text", { asyncContext: "This is passed to the callback" }, async function(result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = result.value; // This is the email content

      // Display status message
      document.getElementById('status-message').textContent = 'Generating for you...';

      // Define prompt for GPT-3
      const prompt = `Please reply to this email.\n${emailBody}\n`;

      // Call the FastAPI application
      fetch('https://mailreplai.vercel.app/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({content: prompt})
      })
      .then(response => response.json())
      .then(data => {
        // Use the generated reply
        console.log(data);
        document.getElementById('gpt-reply').innerHTML = data.replace(/\n/g, '<br>');
        document.getElementById('status-message').textContent = 'Reply generated!';
        // Show the "Use Reply" button
        document.getElementById('use-reply').style.display = 'block';
      })
      .catch(error => {
        // Log any errors that occur during the fetch request
        console.error('Error:', error);
      });
    }
  });
}