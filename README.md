# TranLingo 🗣️🔊🌍

**TranLingo is an innovative speech-to-speech translation application that not only translates your words but also speaks them back in a cloned version of your own voice!** Experience near real-time voice translation with personalized voice output.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ## ✨ Overview

TranLingo aims to break down language barriers by providing a seamless speech-to-speech translation experience. A key feature is its ability to perform one-shot voice cloning, requiring only 10-15 seconds of your audio. This cloned voice is then used for the Text-to-Speech (TTS) output in the target language, offering a more personal and engaging translation.

The voice cloning is language-specific. For instance, to translate your speech into Spanish and have it spoken in your voice, TranLingo first helps you train a Spanish voice clone. This is achieved by using the Gemini API for accurate transliteration of your native language input into Spanish text, which then serves as the training data for your Spanish voice profile.

## 🚀 Key Features

* **Speech-to-Speech Translation:** Speak in one language and hear the translation in another.
* **One-Shot Voice Cloning:** Clone your voice with just 10-15 seconds of audio.
* **Personalized TTS Output:** Translated speech is delivered in your cloned voice.
* **Language-Specific Voice Clones:** Train voice clones for each target language you want to use.
* **Transliteration for Voice Training:** Utilizes Gemini API for accurate transliteration to aid voice clone training in the target language.
* **Near Real-Time Experience:** Employs rate limiting and audio chunking for responsiveness.
* **Secure Authentication:** Uses Clerk for user login, logout, and session management.
* **User Data Storage:** Saves user preferences and data in a PostgreSQL database.

## 🛠️ Tech Stack

* **Frontend:** Next.js
* **Backend:** Flask (Python) - with separate services for main application logic and voice cloning.
* **Speech-to-Text (STT):** OpenAI Whisper
* **Translation:** Meta NLLB-200 (No Language Left Behind)
* **Text-to-Speech (TTS):** Fine-tuned F5-TTS
* **Transliteration & AI:** Gemini API
* **Authentication:** Clerk
* **Database:** PostgreSQL

## ⚙️ Getting Started

Follow these instructions to set up and run TranLingo locally on your machine.

### Prerequisites

* Node.js and npm (for Next.js frontend)
* Python 3.x and pip (for Flask backend)
* Access to a PostgreSQL database
* API keys for:
    * OpenAI (for Whisper)
    * Gemini API
    * Clerk
    * (Potentially others, e.g., for Meta NLLB-200 or F5-TTS if they are hosted/API-based)
    * *You'll need to configure these as environment variables or in configuration files as per the application's setup.*

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-name>
    ```

2.  **Frontend (Next.js):**
    Navigate to the source directory (likely the root or a specific frontend folder) and install dependencies:
    ```bash
    cd path/to/your/nextjs/source_directory 
    npm install
    ```

3.  **Backend (Flask - Main Application):**
    * Navigate to the `flask` directory:
        ```bash
        cd flask
        ```
    * Install Python dependencies. It's recommended to use a virtual environment:
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows use `venv\Scripts\activate`
        ```
    * Install the required libraries. You'll need to identify these from the `import` statements in `flask/main.py` and `flask/app.py` (and any other Python files in this service). For example:
        ```bash
        pip install Flask <library1> <library2> ...
        ```
        *(Ideally, you would create a `requirements.txt` file in this directory for easier dependency management: `pip freeze > requirements.txt` after installing, and then others can use `pip install -r requirements.txt`)*

4.  **Backend (Flask - Cloning Service):**
    * Navigate to the `cloning` directory:
        ```bash
        cd ../cloning # Assuming it's a sibling to the 'flask' directory, adjust path if needed
        ```
    * Set up a virtual environment and install Python dependencies, similar to the main Flask app:
        ```bash
        python -m venv venv
        source venv/bin/activate # On Windows use `venv\Scripts\activate`
        pip install Flask <libraryA> <libraryB> ...
        ```
        

### Running Locally

Ensure all your necessary API keys and database connection strings are correctly configured in your environment variables or project configuration files.

1.  **Start the Frontend (Next.js):**
    In the Next.js source directory:
    ```bash
    npm run dev
    ```
    This will typically start the frontend on `http://localhost:3000`.

2.  **Start the Main Flask Backend:**
    In the `flask` directory (with its virtual environment activated):
    ```bash
    flask run
    ```
    This will typically start the main backend service on `http://localhost:5000`.

3.  **Start the Cloning Flask Backend:**
    In the `cloning` directory (with its virtual environment activated):
    ```bash
    flask run
    ```
    This might also try to start on `http://localhost:5000`. You'll need to configure one of the Flask apps to run on a different port to avoid collision. For example, to run the cloning service on port 5001:
    ```bash
    flask run --port=5001 
    ```
    *(Make sure your frontend is configured to call the correct backend ports.)*

Once all services are running, you should be able to access TranLingo through your browser at the Next.js development server URL (e.g., `http://localhost:3000`).

## 🔮 How It Works (Simplified Flow)

1.  **User Authentication:** User logs in via Clerk.
2.  **Voice Input:** User speaks into the application.
3.  **Voice Clone Training (if needed for a new language):**
    * User provides a 10-15 second audio sample in the target language (or their native language if transliteration is used to generate target language text).
    * For target language text generation (e.g., for Spanish clone from English speaker), Gemini API transliterates user's native language input to the target language (e.g., Spanish).
    * The audio sample + target language text are used to train a voice clone with the F5-TTS model.
4.  **Real-time Translation:**
    * **Speech-to-Text:** User's speech is transcribed by OpenAI Whisper.
    * **Translation:** The transcribed text is translated to the target language by Meta NLLB-200.
    * **Text-to-Speech:** The translated text is converted to speech using the fine-tuned F5-TTS model, utilizing the user's pre-trained voice clone for that language.
5.  **Output:** The translated speech is played back to the user in their cloned voice.
6.  **Data Management:** User data and voice clone information are managed via PostgreSQL.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

*(You can add more specific contribution guidelines here, e.g., coding standards, branch naming conventions.)*

## ❓ Working Demo

https://github.com/user-attachments/assets/38b549bf-011f-4f57-a205-ed48f9ee12d8


## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details (assuming you choose MIT and add a LICENSE.md file).

---

Let me know if you'd like any section expanded or modified!
