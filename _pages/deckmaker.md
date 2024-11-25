---
layout: page
title: Deck Maker
include_in_header: true
---

# Deck Maker

<style>
    #deck-maker {
        max-width: 1200px;
        margin: 0 auto;
    }

    form label {
        display: block;
        margin: 0.5em 0;
    }

    input[type="text"] {
        width: 100%;
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 1em;
        box-sizing: border-box;
    }

    .section {
        padding: 15px;
        margin-bottom: 0px;
        border-radius: 10px;
    }

    .easy-section {
        background-color: #e0f7e9; /* Light green */
        color: #2e7d32; /* Dark green */
        border: 1px solid #66bb6a;
    }

    .medium-section {
        background-color: #fff8e1; /* Light yellow */
        color: #fbc02d; /* Dark yellow */
        border: 1px solid #fdd835;
    }

    .hard-section {
        background-color: #ffebee; /* Light red */
        color: #c62828; /* Dark red */
        border: 1px solid #e57373;
    }

    button {
        display: block;
        width: 100%;
        padding: 10px;
        font-size: 1.2em;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
        
    }

    button:hover {
        background-color: #0056b3;
    }

    #qrcode {
        margin:auto;
        margin-top: 20px;
        text-align: center;
        align: center;
        display: block;
        width: 100%;
        border-radius: 5px;
    }

    /* Media query for larger screens */
    @media (min-width: 768px) {
        #deck-maker {
            max-width: 100%;
        }

        /* Wrap only the easy, medium, and hard sections side by side */
        .section-container {
            display: flex;
            gap: 20px;
            justify-content: space-between;
        }

        .section {
            flex: 1; /* Each section takes equal space */
            margin-bottom: 0; /* Remove bottom margin for side-by-side layout */
        }
        #qrcode {
            width: calc(45.5% - 20px); /* Match QR code width to one column's width, accounting for flex gap */
            
        }
    }
</style>

<div id="deck-maker">
    <form id="deckForm">
        <label>Deck Name:
            <input type="text" id="username" placeholder="Enter Name Here" />
        </label>
        <div class="section-container">
            <div class="section easy-section">
                <h3>Easy Dares</h3>
                {% for i in (1..12) %}
                    <label>Easy Dare {{ i }}:
                        <input type="text" id="easy{{ i }}" placeholder="Enter Dare Here" />
                    </label>
                {% endfor %}
            </div>
            <div class="section medium-section">
                <h3>Medium Dares</h3>
                {% for i in (1..12) %}
                    <label>Medium Dare {{ i }}:
                        <input type="text" id="medium{{ i }}" placeholder="Enter Dare Here" />
                    </label>
                {% endfor %}
            </div>
            <div class="section hard-section">
                <h3>Hard Dares</h3>
                {% for i in (1..12) %}
                    <label>Hard Dare {{ i }}:
                        <input type="text" id="hard{{ i }}" placeholder="Enter Dare Here" />
                    </label>
                {% endfor %}
            </div>
        </div>
        <button type="button" onclick="generateQRCode()">Generate QR Code</button>
    </form>
    <canvas id="qrcode"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
<script>
    // Function to compile dares into a CSV string (same as Swift's compileDaresIntoString)
    function compileDaresIntoString(easy, medium, hard, deckName) {
        const easyDares = easy.join(', ');
        const mediumDares = medium.join(', ');
        const hardDares = hard.join(', ');
        return `${deckName},\n${easyDares}, ${mediumDares}, ${hardDares}`;
    }
    // Function to generate a QR code
    function generateQRCode() {
        // Step 1: Get values from form fields
        const deckName = document.getElementById('username').value.trim();
        const easyDares = Array.from({ length: 12 }, (_, i) => document.getElementById(`easy${i + 1}`).value.trim());
        const mediumDares = Array.from({ length: 12 }, (_, i) => document.getElementById(`medium${i + 1}`).value.trim());
        const hardDares = Array.from({ length: 12 }, (_, i) => document.getElementById(`hard${i + 1}`).value.trim());
         console.log(easyDares);
        // Step 2: Prepare the CSV string
        const compiledString = compileDaresIntoString(easyDares, mediumDares, hardDares, deckName || 'Random Deck');
        console.log(compiledString);
         // Step 3: Convert string to UTF-8 encoded data (Uint8Array)
        const utf8Encoder = new TextEncoder();
        const inputData = utf8Encoder.encode(compiledString);
        // Step 4: Compress the UTF-8 data using Zlib
        const compressedData = pako.deflateRaw(inputData);
        // Step 5: Convert the compressed data (Uint8Array) to Base64
        const compressedString = Array.from(compressedData, (byte) => String.fromCharCode(byte)).join('');
        const base64EncodedString = btoa(String.fromCharCode(...compressedData));
        console.log(compiledString);
        console.log(base64EncodedString);
        // Step 6: Generate the QR code using the Base64 string
        const qr = new QRious({
            element: document.getElementById('qrcode'),
            value: base64EncodedString,
            size: 600, // Set the size of the QR code
            foreground: 'black', // Foreground color of the QR code
            background: 'white', // Background color of the QR code
        });
    }
</script>


