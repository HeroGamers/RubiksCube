import asyncio
import websockets


async def websocketlistener():
    print("Starting listener...")
    uri = "ws://play.nfs.codes:8080"
    async with websockets.connect(uri) as websocket:
        try:
            res = await websocket.recv()
            if res:
                print(res)
        except Exception as e:
            print(e)

# Start the Websocket Listener
asyncio.get_event_loop().run_until_complete(websocketlistener())
asyncio.get_event_loop().run_forever()
