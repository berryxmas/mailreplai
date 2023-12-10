/* global document, Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
    document.getElementById('generate-reply').onclick = generateReply;
  }
});

export async function run() {
  // Get a reference to the current message
  const item = Office.context.mailbox.item;
  // Write message property value to the task pane
  document.getElementById("item-subject").innerHTML = "<b>Subject:</b> <br/>" + item.subject;
}

export async function generateReply() {
  console.log('Generate Reply button pressed. Reply is on its way...');

  // Read content from the current message
  Office.context.mailbox.item.body.getAsync("text", { asyncContext: "This is passed to the callback" }, async function(result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = result.value; // This is the email content

      // Get the first three lines of the email body
      const firstThreeLines = emailBody.split('\n').slice(0, 3).join('\n');

      // Display the first three lines in the 'item-content' element
      document.getElementById('item-content').textContent = firstThreeLines;

      // Display status message
      document.getElementById('status-message').textContent = 'Working for you...';

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
      })
      .catch(error => {
        // Log any errors that occur during the fetch request
        console.error('Error:', error);
      });
    }
  });
}