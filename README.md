## Requirements
- `node` v16.9.0 or higher
- `git` command line

## Installation
- Run `git clone https://github.com/10407dev/The-Man-Bot.git`
- Run `cd The-Man-Bot && npm install`

## Starting
- Create a file named `.env` and fill it like so:
```
TOKEN=TOKENHERE # Your bot token
CLIENT_ID=CLIENTIDHERE # Your bot client id (same as application id)
TESTING_GUILD_ID=TESTINGGUILDIDHERE # Your testing guild (server) id, for dev commands
NODE_ENV=prod # "prod" if you want to deploy global commands, or anything else if you don't
```
- Run `npm run deploy` to deploy commands
- Run `npm run database -- --fork` to host a database
- Run `npm start` to start a bot
