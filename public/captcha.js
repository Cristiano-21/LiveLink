// Genera un captcha casuale
function generate() {
  const captchaLength = 5; // Lunghezza del captcha
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";

  for (let i = 0; i < captchaLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    captcha += characters[randomIndex];
  }

  // Mostra il captcha nell'elemento con id "key"
  document.getElementById("key").textContent = captcha;
}

// Chiama la funzione generate() subito all'avvio dello script
generate();

// Verifica il captcha
function printmsg() {
  const userInput = document.getElementById("submit").value;
  const captchaKey = document.getElementById("key").textContent;
  const errorMessage = document.getElementById("error-message");

  if (userInput === captchaKey) {
    errorMessage.textContent = "Captcha correct !";
    submitButton.disabled = true;
  } else {
    errorMessage.textContent = "Captcha wrong, please try again !";
    submitButton.disabled = false;
  }
}
