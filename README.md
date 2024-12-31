# autoreloadmcpe README

This extension is a simple extension that reloads the current Minecraft: Bedrock Edition addon every time you save a file. This is useful for developers who are working on a Minecraft: Bedrock Edition and want to see their changes in-game without having to manually reload.

You can add an delay to the reload in the settings.

## Requirements

Run /wsserver localhost:8080 in mcpe to connect to the extension. The command gets copied to the clipboard when you click on the bottom right to start the wsserver.

## Important

If you can't connect to the websocket, you may have to enable loopback for mcpe, as it its a uwp app and doesn't allow it.
run this command as administrator in powershell to fix it. (the long number is the sid of mcpe)
```powershell
CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436
```

## Versions

For version history, please refer to the [versions.md](versions.md) file.

