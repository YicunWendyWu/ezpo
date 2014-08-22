# Ezpo Hipchat Add-on #

This is a Hipchat add-on with 3 features: timer, voting, lucky number picking

## Installation ##
In the add-on admin page of your Hipchat room, create a new private add-on with capabilities URL: ```https://ezpo.herokuapp.com/capabilities```

## Usage ##
### /ezpo timer <minutes> <message> ###
After <minutes> minutes, ezpo will send <message> to the room

### /ezpo votestart <votename> ###
Creates a new vote called <votename>

### /ezpo vote <votename> <option> ###
Vote for the <option> in the <votename> vote

### /ezpo votestatus <votename> ###
Prints the current status for the <votename> vote

### /ezpo luckystart <total> <lucky> ###
Creates a lucky game with <total> numbers and <lucky> lucky numbers

### /ezpo lucky <pick> ###
Checks if <pick> is a lucky number

### Use Case ###
It's Amy's birthday, the team decides to get a birthday cake for her. A few days before the date, we set up the timer to use as a reminder. On the date, we use the vote-related functionalities to vote on the cake flavour, and use the lucky number-related functionalities to select a person to pickup the cake from the supermarket. 

## TODO ##

* Use a database to remember authentication info. (currently, authenitcation info will be lost if service is restarted so in order to continue using the add-on, room admins will need to reinstall the add-on)
* Use consistent HTTP connections (currently creating a new connection every time we send a message)
