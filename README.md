# SocketIO Chatroom V2

An anonymous chatroom application built with Node.js, Socket.IO, Express, and the Uploadcare API for file uploads.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

## Features

- Real-time chat functionality using Socket.IO
- Create and join chat rooms
- Upload and share images in chat rooms using Uploadcare API
- User-friendly UI with Tailwind CSS

## Installation

To install and run the project locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/code3-dev/socketio-chatroom.git
    cd socketio-chatroom
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Open the `config.js` file and replace the placeholder with your Uploadcare public key:
    ```javascript
    const UPLOADCARE_PUBLIC_KEY = "your_public_key_here";
    ```

4. Start the server:
    ```bash
    npm start
    ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

### Creating a Chat Room

1. Open the application in your browser.
2. Enter a room name and your username.
3. Click "Create Room" to enter the chat room.

### Joining a Chat Room

1. Share the room URL with others or open the room URL yourself.
2. Enter your username to join the chat room.

### Chatting and Sharing Files

1. Type your message in the chat input and press "Send".
2. To upload an image, click the file upload button, select an image, and it will be shared in the chat room.

## Configuration

The server configuration is primarily managed through the `server.js` file. Here is an overview of the key components:

- **Express server setup**: Serves static files and handles main page routes.
- **Socket.IO setup**: Manages socket events for joining rooms, sending messages, and uploading files.
- **File uploads**: Handled via the Uploadcare API, with the logic in `config.js`.

## Contributing

We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## Contact

- **Name**: Hossein Pira
- **Email**: [h3dev.pira@gmail.com](mailto:h3dev.pira@gmail.com)
- **Instagram**: [h3dev.pira](https://instagram.com/h3dev.pira)
- **Telegram**: [h3dev](https://t.me/h3dev)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for using SocketIO Chatroom! If you have any questions or feedback, feel free to reach out via the contact information above.