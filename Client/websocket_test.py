import asyncio
import websockets


async def websocketlistener():
    print("Starting listener...")
    uri = "ws://play.nfs.codes:8080"
    async with websockets.connect(uri) as websocket:
        await websocket.send("Solve")
        res = await websocket.recv()
        if res:
            print(res)

# Start the Websocket Listener
asyncio.get_event_loop().run_until_complete(websocketlistener())