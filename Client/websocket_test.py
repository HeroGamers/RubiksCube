import asyncio
import websockets
from time import sleep

move_loop = asyncio.new_event_loop()


async def moveSteppers():
    print(3)
    await asyncio.sleep(10)
    print(4)


async def websocketlistener():
    print("Starting listener...")
    uri = "ws://play.nfs.codes:8080"
    async with websockets.connect(uri) as websocket:
        while True:
            print(1)
            try:
                res = await websocket.recv()
                if res:
                    print(res)
                    asyncio.ensure_future(moveSteppers())
                    print(2)
            except Exception as e:
                print(e)

# Start the Websocket Listener
asyncio.get_event_loop().run_until_complete(websocketlistener())
asyncio.get_event_loop().run_forever()
