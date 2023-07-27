import { useEffect, useState } from 'react'
import axios from 'axios'


export default function Example() {
    const [data, setData] = useState([])

    useEffect(() => {
        axios.get('http://localhost:8000/test')
            .then(res => {
                setData(res.data)
            })
            .catch(err => console.log(err))
    }, [])


    return (
        <div>{data}</div>
    )
}
