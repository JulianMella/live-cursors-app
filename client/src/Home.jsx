import useWebSocket from "react-use-websocket"
import { useEffect, useRef } from "react"
import throttle from "lodash.throttle"
import { Cursor } from "./components/Cursor"

const renderCursors = (users, username) => {
    return Object.keys(users).map(uuid => {

        const user = users[uuid]
        if (user.username !== username) {
            console.log("This is also mine!")
            return (
                <Cursor key={uuid} point={[user.state.x, user.state.y]} />
            )
        }

    })
}

const renderUsersList = users => {
    return (
        <ul>
            {Object.keys(users).map(uuid => {
                return <li key={uuid}>{JSON.stringify(users[uuid])}</li>
            })}
        </ul>
    )
}

export function Home({ username }) {

    const WS_URL = "ws://127.0.0.1:8000"
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username }
    }) // SHARE?

    const THROTTLE = 50
    const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE))


    useEffect(() => {
        // ask the server to send everyones state the second we load the components
        sendJsonMessage({
            x: 0,
            y: 0
        })
        window.addEventListener("mousemove", e => {
            sendJsonMessageThrottled.current({
                x: e.clientX,
                y: e.clientY
            })
        })
    }, [])

    if (lastJsonMessage) {
        return <>
            {renderCursors(lastJsonMessage, username)}
            {renderUsersList(lastJsonMessage)}
        </>
    }
    return <h1>Hello, {username}</h1>
}