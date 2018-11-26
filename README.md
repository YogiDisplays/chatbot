![](mirza.png)
## Mirza AI
##### An automated and scalable customer eligibility checker for banks' products/services. 

#### What is it?
Mirza AI provides an easy way to validate customers that If they're eligible for the banks' products and services or not. Mirza AI asks some questions and requests a photo of an ID card to understand the customer. After the whole process of steps, we can extract the PIN code of the ID card and use some official APIs (not integrated) to verify it. Mirza AI is offering a dynamic content and flexible structure that can be adapted to any dashboard and database. Mirza AI has a symbolic loan, insurance, and travel features. It doesn't represent the actual product. In this state of Mirza AI, the banks should add their own logic to the bot. We're planning to make an awesome dashboard that provides every little insight of the customer interaction.
**Please be aware of that, this is a conceptual project.**

#### Why Mirza?
Mirza means writer and assistant. And also we thought the Mirza name is the most popular customer support name. So, we named our product Mirza AI.

#### Note
The data extraction part is written in Python and uses OCR. Unfortunately, we can't provide the source code of it. We want to keep it closed source, have rights to develop and sell it.

#### Usage
    npm install
1. Install all the required modules.
2. Create a Facebook app and enter the credentials to "config.json" (https://developers.facebook.com/docs/apps/).
2. Running on local
    - Install the ngrok proxy tunneling software to expose an HTTPS server to the network.
    - Copy the generated ngrok website URL to Messenger's webhook field in the Developer Console of Facebook (e.g.: https://7a59bdbe.eu.ngrok.io/webhook)
    - Enter the validation token on the below field called **Verify Token** (check 'verifyToken' @ config.json).
    - You're almost ready! Now run the server with the `npm start` command.
4. Running on production
    - The installation steps are same but again you have to run it via HTTPS server.
    
You can access to our bot on https://www.messenger.com/t/mirzaaibot. Which is still in the review process by Facebook.