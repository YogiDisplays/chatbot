## Mirza AI
##### An automated and scalable customer eligibility checker for banks' products/services. 

#### Why Mirza?
We thought the Mirza name is the most popular customer support name. So, we named our product Mirza AI.

#### How to install
    npm install
1. Install all the required modules.
2. Running on local
    - Install the ngrok proxy tunneling software to expose an HTTPS server to the network.
    - Copy the generated ngrok website URL to Messenger's webhook field in the Developer Console of Facebook (e.g.: https://7a59bdbe.eu.ngrok.io/webhook)
    - Enter the validation token on the below field called **Verify Token** (check 'verifyToken' @ config.json).
    - You're almost ready! Now run the server with the `npm start` command.
3. Running on production
    - The installation steps are same but again you have to run it via HTTPS server.