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

// Verifica il captcha
function printmsg() {
  const userInput = document.getElementById("submit").value;
  const captchaKey = document.getElementById("key").textContent;

  if (userInput === captchaKey) {
    alert("Captcha corretto! Puoi procedere.");
    submitButton.disabled = true;
  } else {
    alert("Captcha errato. Riprova.");
    submitButton.disabled = false;
  }
}
