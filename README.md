# Minecraft wrapper

So I wanted to run minecraft on my home server, but it'll only get played sporadically. To save some system resources when it's not in use, I thought I'd write up a system to only open a server when someone attempts to connect, then spin it down when there's no one there.  

## TODOs
- [ ] Fix terminal sockets
   - need to be able to access ther stdin/out of a previously started minecraft instance (not the node process)
- [ ] Better piping for initial setup
- [ ] Extract server config from the minecraft `server.properties` file
  - [ ] allow modification to `server.properties` to be written back
- [ ] Add a 'just run minecraft without the wrapper' debug funcionality
  - useful for first time running 
- [ ] Better user experience when waiting for server to startup?
  - Fake the server status response to client?
  - Try to extend their timeout?

## Running it:
```sh
# clone this repo
git clone 

# Install dependencies
npm install

# 
```

```
$ node ./ --help
Options:
  --version                 Show version number                        [boolean]
  --minecraftDirectory, -m  the folder to run minecraft from
                                 [default: "/home/e314c/minecraftServerWrapper"]
  --minecraftFile, -f       the filename for the minecraft server jar (without
                            path)                        [default: "server.jar"]
  --port, -p                The port to expose for clients to connect to
                                                                [default: 25569]
  --detach, -d              Detach the process to run after this process (and/or
                            it's parent) exits.                        [boolean]
  --timeout, -t             How often the server should check for an empty
                            server. It will shut down when 2 checks find no
                            people. (minutes)                       [default: 5]
  --help                    Show help                                  [boolean]
  ```

## Attach to a running server terminal
You should be able to access the terminal of a previously running instance by _attaching_ into it:
```
node ./src/attach.js
```
