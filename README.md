
# Hospital Demo

This is a Hospital Demo Project implementation in Node.js using MongoDB and Socket written in JavaScript.

## Feature

	· Three types of authentication : Admin, Doctor and Patient. A simplistic yet effective approach to handle user roles. 

	· Admin could add/edit/delete doctor or patient. 

	· Patient can see the list of doctors and Doctors can see the list of patients, and admin can see both patient and doctor list.

	· Patient and doctor can chat each other, admin can chat to both patients as well as doctor. (Socket connection for handling chats).

## Setup

	Install Node

	https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

	Install MongoDB

	https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

	Create database in mongodb database
	# use hospital_demo #



## Installation

	Make sure you have Node.js and npm installed.

	1. Clone or Download the repository
		$ https://github.com/kapil2kumar/hospital_demo.git
		$ cd hospital_demo

	2. Install Dependencies
		$ npm install

	3. Create Admin User
		$ node create_admin.js

	4. Start the application
		$ node app.js

	Server will be available on port [http://localhost:8080](http://localhost:8080).


## Support
	I've written this script in my free time to learn node. If you find it useful, please support the project.

## Credits
	Creator : [Kapil Kumar] (kapilboon2012@gmail.com)





