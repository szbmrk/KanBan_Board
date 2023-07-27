import { useEffect, useState } from 'react'
import axios from 'axios'


export default function Example() {
    const [data, setData] = useState([])

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/test')
            .then(res => {
                setData(res.data)
                console.log(res.data)
            })
            .catch(err => console.log(err))
    }, [])


    return (
        <div>{JSON.stringify(data)}</div>
    )
}
