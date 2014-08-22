# Ezpo Hipchat Add-on #

This is a very basic echo add-on which echos messages containing /ezpo

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

## TODO ##
Use a database to remember authentication info. (currently, authenitcation info will be lost if service is restarted so in order to continue using the add-on, room admins will need to reinstall the add-on)
