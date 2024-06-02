# Medibyte: Setup and Installation Guide

Welcome to the Medibyte prototype project! This guide will help you set up and install the project locally on your system. Please follow the steps below carefully to get started.

## Prerequisites

Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup Instructions

### Step 1: Fork the Repository

1. Go to the Medibyte GitHub repository.
2. Click the "Fork" button on the top right corner of the page. This will create a copy of the repository under your GitHub account.
3. If possible, give a star to the project to show your support!

### Step 2: Clone the Forked Repository

1. Navigate to your forked repository on GitHub.
2. Click the "Code" button and copy the HTTPS URL.
3. Open your terminal and run the following command to clone the repository:
    bash
    git clone <HTTPS_URL>
    
   Replace <HTTPS_URL> with the URL you copied in the previous step.

### Step 3: Change Directory to Medibyte

Navigate to the Medibyte project directory by running:
bash
cd Medibyte


### Step 4: Open the Project in Your Code Editor

If you're using Visual Studio Code, you can open the project by running:
bash
code .


### Step 5: Change Directory to the Client

Navigate to the client directory where the frontend code resides:
bash
cd client


### Step 6: Install Dependencies

Install the necessary dependencies for the project by running:
bash
npm install


### Step 7: Start the Development Server

Start the development server by running:
bash
npm run dev


Once the server starts, you will see an output similar to:

VITE v5.2.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help


### Step 8: View the Project

Open your web browser and navigate to http://localhost:5173/. You should now see the Medibyte prototype running locally on your machine.

## Additional Scripts

- *Build*: To build the project for production, run:
  bash
  npm run build
  
- *Preview*: To preview the production build, run:
  bash
  npm run preview
  
- *Lint*: To lint the code, run:
  bash
  npm run lint
  

## Contributing

We welcome contributions! Please refer to our [Contributing Guide](CONTRIBUTING.md) for more details on how you can contribute to the project.

Thank you for setting up the Medibyte prototype. If you encounter any issues or have any questions, feel free to open an issue on the repository. Happy coding!
