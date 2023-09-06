function toggleNav() {
    if (document.getElementById("mySidebar").style.width === "250px") {
        closeNav();
    } else {
        openNav();
    }
}

// reset chat
function resetChat() {
    fetch('/reset_chat', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            // Clear the chat in the UI
            let upperdiv = document.getElementById('upperid');
            upperdiv.innerHTML = ''; // Clear the chat if needed

            // Append the greeting message
            const greetingDiv = document.createElement('div');
            greetingDiv.className = "message";
            greetingDiv.innerHTML = `
                <div class="appmessagediv">
                    <div class="appmessage">
                        Hello, I'm here to help you write a winning scholarship essay. I will be guiding you through the process of crafting a compelling essay that will impress the scholarship committee. Are you ready to get started?
                    </div>
                </div>
            `;
            upperdiv.appendChild(greetingDiv);
        }
    });
}

window.addEventListener('load', resetChat);



function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}
// for scrolling messages
function scrollToBottom() {
var div = document.getElementById("upperid");
div.scrollTop = div.scrollHeight;
}
scrollToBottom()

document.getElementById("userinputform").addEventListener("submit", function (event) {
event.preventDefault();
formsubmitted();
});

// Allow form submission on Enter key press
document.getElementById("userinput").addEventListener("keydown", function (event) {
if (event.key === "Enter") {
    event.preventDefault();
    formsubmitted();
}
});

// sending request to python server
const formsubmitted = async () => {
let userinput = document.getElementById('userinput').value
let sendbtn = document.getElementById('sendbtn')
let userinputarea = document.getElementById('userinput')
let upperdiv = document.getElementById('upperid')


upperdiv.innerHTML = upperdiv.innerHTML + `<div class="message">
    <div class="usermessagediv">
            <div class="usermessage">
                ${userinput}
            </div>
    </div>
</div>`
sendbtn.disabled = true
userinputarea.disabled = true
scrollToBottom()
document.getElementById('userinput').value = ""
document.getElementById('userinput').placeholder = "Wait . . ."

const response = await fetch("https://tylerg.pythonanywhere.com/data", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: userinput })


});
let json = await response.json();

document.getElementById('userinput').placeholder = "Your message..."


if (json.response) {
    let message = json.message
    message = message.toString()

    upperdiv.innerHTML = upperdiv.innerHTML + `<div class="message">
    <div class="appmessagediv">
        <div class="appmessage" id="temp">

        </div>
    </div>
</div>`
    let temp = document.getElementById('temp')
    let index = 0
    function displayNextLetter() {
        scrollToBottom()
        if (index < message.length) {
            temp.innerHTML = temp.innerHTML + message[index];
            index++;
            setTimeout(displayNextLetter, 30);
        } else {
            temp.removeAttribute('id')
            sendbtn.disabled = false
            userinputarea.disabled = false
        }
    }
    displayNextLetter()
    scrollToBottom()

}
else {
    let message = json.message
    upperdiv.innerHTML = upperdiv.innerHTML +
        `<div class="message">
    <div class="appmessagediv">
        <div class="appmessage"  style="border: 1px solid red;">
          ${message}

        </div>
    </div>
</div>`
    sendbtn.disabled = false
    userinputarea.disabled = false
}

scrollToBottom()


}

window.onload = function() {
fetch('https://tylerg.pythonanywhere.com/set_prompt', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'standard_essay' })
});
};

document.getElementById('model').addEventListener('change', function() {
fetch('https://tylerg.pythonanywhere.com/set_model', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: this.value })
});
});

document.getElementById('word_limit').addEventListener('change', function() {
fetch('https://tylerg.pythonanywhere.com/set_word_limit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word_limit: this.value })
});
});

document.getElementById('temperature').addEventListener('change', function() {
fetch('https://tylerg.pythonanywhere.com/set_temperature', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ temperature: this.value })
});
});

document.getElementById('prompt').addEventListener('change', function() {
fetch('https://tylerg.pythonanywhere.com/set_prompt', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: this.value })
});
});

