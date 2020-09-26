# Minecraft wrapper

So I wanted to run minecraft on my home server, but it'll only get played sporadically. To save some system resources when it's not in use, I thought I'd write up a system to only open a server when someone attempts to connect, then spin it down when there's no one there.  


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
                       [default: "<currentDirectory>"]
  --minecraftFile, -f       the filename for the minecraft server jar (without
                            path)                        [default: "server.jar"]
  --port, -p                The port to expose for clients to connect to
                                                                [default: 25569]
  --detach, -d              Detach the process to run after this process (and/or
                            it's parent) exits.                        [boolean]
  --help                    Show help                                  [boolean]
  ```
